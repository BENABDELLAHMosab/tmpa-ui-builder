import express from 'express';
import { loginController, meController, createDeveloperController } from '../controllers/auth.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/login', loginController);
router.get('/me', authenticateJWT, meController);
router.post('/users', authenticateJWT, requireRole('admin'), createDeveloperController);

export default router;
