import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { userController } from '../controllers/user.controller.js';

const router = Router();

router.get('/me', authenticateToken, userController.getCurrentUser);
router.put('/me', authenticateToken, userController.updateProfile);

export default router;