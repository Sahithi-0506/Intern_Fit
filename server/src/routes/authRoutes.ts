import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Rate-limited sensitive endpoints
const authLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, maxHits: 30, message: 'Too many authentication attempts.' });

router.post('/register', authLimiter, authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateStudentProfile);

export default router;
