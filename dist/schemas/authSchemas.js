"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.
        string("Name is required")
        .trim()
        .min(2, "Minimum 2 characters are required")
        .max(50, "Maximum 50 characters are required"),
    email: zod_1.z.email("Please provide valid email address"),
    password: zod_1.z.
        string("Password is required")
        .min(8, " minimun 8 characters required")
        .max(72, "Maximum 72 characters are required")
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email('Please provide a valid email address'),
    // Only "is it there?" on purpose: users who registered under the old
    // 6-character rule must still be able to log in
    password: zod_1.z.string('Password is required').min(1, 'Password is required'),
});
