"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config/config");
const User_1 = require("../models/User");
const producer_1 = require("../kafka/producer"); // NEW
// A fake hash used when an email doesn't exist (explained in login below)
const DUMMY_HASH = bcryptjs_1.default.hashSync('not-a-real-password', 10);
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // 2. All three fields are required
        if (!name || !email || !password) {
            res
                .status(400)
                .json({ message: "Name, email and password are required" });
            return;
        }
        if (password.length < 6) {
            res
                .status(400)
                .json({ message: "Password must be atleast 6 characters" });
            return;
        }
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({ message: "Email is already registered" });
        }
        const hashPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.User.create({ name, email, password: hashPassword });
        // NEW: tell Kafka a user registered
        await (0, producer_1.sendUserEvent)('USER_REGISTERED', user.email, user._id.toString());
        res.status(200).json({
            message: "Success",
            user: { id: user.id, name: user.name, email: user.email },
        });
    }
    catch (error) {
        // Anything unexpected (e.g. database problem) lands here
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: " email and passowrd required" });
            return;
        }
        const normalizedEmail = email.toLowerCase();
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // NEW: record failed attempts (useful to spot someone guessing passwords)
            await (0, producer_1.sendUserEvent)('LOGIN_FAILED', normalizedEmail);
            res.status(401).json({ message: "Invalid email" });
            return;
        }
        // 3. Compare the typed password with the hashed one in the database
        //    bcrypt hashes the typed password the same way and checks if they match
        // 2. Use the real hash if the user exists, otherwise the dummy hash
        const hashToCheck = user ? user.password : DUMMY_HASH;
        // 3. Always run the comparison, so the timing is the same either way
        const isMatch = await bcryptjs_1.default.compare(password, hashToCheck);
        // const isMatch = await bcrypt.compare(password, user.password, DUMMY_HASH);
        if (!isMatch) {
            // NEW
            await (0, producer_1.sendUserEvent)('LOGIN_FAILED', normalizedEmail, user._id.toString());
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, config_1.JWT_SECRET, { expiresIn: "1h" });
        // NEW: tell Kafka a user logged in
        await (0, producer_1.sendUserEvent)('USER_LOGGED_IN', user.email, user._id.toString());
        res.json({
            message: "Login Successful",
            token: token,
            user: { id: user._id, email: user.email, name: user.name },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        // The auth middleware already checked the token
        // and saved the user's id in res.locals.userId
        console.log("userId:", res.locals.userId, typeof res.locals.userId);
        const user = await User_1.User.findById(res.locals.userId);
        // const user = users.find((u) => u.id === res.locals.userId)
        if (!user) {
            res.status(404).json({ message: "Invalid User" });
        }
        res.status(200).json({
            message: "Success",
            user: { id: user?._id, name: user?.name, email: user?.email },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProfile = getProfile;
// export const login = (req: Request, res: Response): void => {
//     const {email, password} = req.body ?? {};
//     if(!email || !password){
//         res.status(400).json({message: " email and passowrd required"})
//         return;
//     }
//    // Find the user by email, then check THAT user's password
//   const user = users.find((u) => u.email === email);
//   if (!user || user.password !== password) {
//     res.status(401).json({ message: 'Invalid email or password' });
//     return;
//   }
//     const token = jwt.sign({id: user?.id}, JWT_SECRET, {expiresIn: '1h'} )
//     res.json({
//         message: "Login Successful",
//         token : token,
//         user: {id: user?.id, email: user?.email, name: user?.name}
//     })
// }
// ─────────────────────────────────────────────
// PROFILE  →  GET /api/auth/profile  (needs a token)
//
// export const getProfile= (req: Request, res: Response): void => {
//      // The auth middleware already checked the token
//   // and saved the user's id in res.locals.userId
//   console.log('userId:', res.locals.userId, typeof res.locals.userId);
//     const user = users.find((u) => u.id === res.locals.userId)
//     if(!user){
//         res.status(404).json({message:"Invalid User"})
//     }
//     res.status(200).json({
//         message: "Success",
//         user: {id: user?.id, name: user?.name, email: user?.email}
//     })
// }
