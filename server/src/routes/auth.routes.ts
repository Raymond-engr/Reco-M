import { Router } from 'express';
import { validateRequests } from '../middleware/validateRequests.js';
import { authController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { 
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  emailSchema 
} from '../validators/auth.validator.js';

const router = Router();

// Public routes
router.post('/register', validateRequests(registerSchema), authController.register);
router.post('/login', validateRequests(loginSchema), authController.login);
router.post('/google', authController.googleAuth);

// Email verification routes
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', validateRequests(emailSchema), authController.resendVerification);

// Password reset routes
router.post('/forgot-password', validateRequests(emailSchema), authController.forgotPassword);
router.post('/reset-password/:token', validateRequests(resetPasswordSchema), authController.resetPassword);

// Token management
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);

export default router;