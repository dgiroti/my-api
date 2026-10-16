import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { users } from "../data/user";
import { JWT_SECRET, EXPIRES_IN } from "../config/config";
import { User } from "../models/User";
import { sendUserEvent } from '../kafka/producer'; // NEW

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body ?? {};

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

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ message: "Email is already registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashPassword });

    // NEW: tell Kafka a user registered
    await sendUserEvent('USER_REGISTERED', user.email, user._id.toString());

    res.status(200).json({
      message: "Success",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    // Anything unexpected (e.g. database problem) lands here
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ message: " email and passowrd required" });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        // NEW: record failed attempts (useful to spot someone guessing passwords)
      await sendUserEvent('LOGIN_FAILED', normalizedEmail);
      res.status(401).json({ message: "Invalid email" });
      return;
    }

    // 3. Compare the typed password with the hashed one in the database
    //    bcrypt hashes the typed password the same way and checks if they match

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // NEW
      await sendUserEvent('LOGIN_FAILED', normalizedEmail, user._id.toString());
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // NEW: tell Kafka a user logged in
    await sendUserEvent('USER_LOGGED_IN', user.email, user._id.toString());

    res.json({
      message: "Login Successful",
      token: token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // The auth middleware already checked the token
    // and saved the user's id in res.locals.userId
    console.log("userId:", res.locals.userId, typeof res.locals.userId);
    const user = await User.findById(res.locals.userId);
    // const user = users.find((u) => u.id === res.locals.userId)

    if (!user) {
      res.status(404).json({ message: "Invalid User" });
    }

    res.status(200).json({
      message: "Success",
      user: { id: user?._id, name: user?.name, email: user?.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

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
