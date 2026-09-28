import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller';
import { jwtVerify } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/request-validation.middleware';
import { registerSchema } from './validators/auth-register.validator';
import { loginSchema } from './validators/auth-login.validator';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50 });

router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', jwtVerify(), authController.me);

export default router;
