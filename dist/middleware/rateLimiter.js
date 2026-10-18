"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Max 10 login/register attempts per IP address every 15 minutes
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes, in milliseconds
    limit: 10,
    standardHeaders: 'draft-7', // tells clients their remaining attempts in a header
    legacyHeaders: false,
    message: { message: 'Too many attempts, please try again in 15 minutes' },
});
