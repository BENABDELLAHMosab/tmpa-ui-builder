import { Router } from 'express';
import { getAdminDashboard, getDeveloperDashboard } from '../controllers/dashboard.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/admin', authenticateJWT, requireRole('admin'), getAdminDashboard);
router.get('/developer', authenticateJWT, getDeveloperDashboard);

export default router;
