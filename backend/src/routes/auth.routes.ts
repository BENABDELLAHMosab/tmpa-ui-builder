import express from 'express';
import {
  loginController,
  meController,
  createDeveloperController,
  getDevelopersController,
  updateDeveloperStatusController,
  deleteDeveloperController
} from '../controllers/auth.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/login', loginController);
router.get('/me', authenticateJWT, meController);
router.post('/users', authenticateJWT, requireRole('admin'), createDeveloperController);
router.get('/users', authenticateJWT, requireRole('admin'), getDevelopersController);
router.patch('/users/:userId/status', authenticateJWT, requireRole('admin'), updateDeveloperStatusController);
router.delete('/users/:userId', authenticateJWT, requireRole('admin'), deleteDeveloperController);

export default router;
