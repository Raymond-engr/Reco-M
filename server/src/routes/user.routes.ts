import { Router } from 'express';
import { validateRequests } from '../middleware/validateRequests.js';
import { authenticateToken, authorize, rateLimiter } from '../middleware/auth.middleware.js';
import { userController } from '../controllers/user.controller.js';
import { updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();

const standardLimit = rateLimiter(20, 15 * 60 * 1000);

router.get('/me', authenticateToken, standardLimit, userController.getCurrentUser);
router.put('/me', 
  authenticateToken, 
  standardLimit,
  validateRequests(updateProfileSchema), 
  userController.updateProfile
);

// Admin-only routes
router.get('/all', 
  authenticateToken, 
  authorize('admin'), 
  standardLimit,
  userController.getAllUsers
);

export default router;