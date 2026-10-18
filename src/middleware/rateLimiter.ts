import rateLimit from 'express-rate-limit';

// Max 10 login/register attempts per IP address every 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes, in milliseconds
  limit: 10,
  standardHeaders: 'draft-7', // tells clients their remaining attempts in a header
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
});