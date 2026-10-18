import { Router } from 'express';
import { login, getProfile, register } from '../controllers/authController';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { loginSchema, registerSchema } from '../schemas/authSchemas';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register); 
router.post('/login', authLimiter, validate(loginSchema), login)

router.get('/profile', auth, getProfile)

export default router