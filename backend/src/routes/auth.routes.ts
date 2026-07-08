import express from 'express';
import { loginController, meController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/login', loginController);
router.get('/me', authenticateJWT, meController);

export default router;
