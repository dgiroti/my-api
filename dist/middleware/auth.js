"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // Reject when the header is missing OR doesn't start with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' });
        return; // stop here so we never reach verify() without a token
    }
    // authHeader is now narrowed to `string`, so token is a `string` too
    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    let payload;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        // verify() returns a plain string if the token was signed with a string payload
        if (typeof decoded === 'string') {
            throw new Error('Unexpected token payload');
        }
        payload = decoded;
    }
    catch {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
    // Outside the try, so errors from later middleware aren't reported as auth failures
    res.locals.userId = payload.id;
    next();
};
exports.auth = auth;
