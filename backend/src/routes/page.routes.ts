import { Router } from 'express';
import { createPage, getPages, getPageById, updatePage, deletePage, submitPage, approvePage, rejectPage } from '../controllers/page.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', createPage);
router.get('/', getPages);
router.get('/:id', getPageById);
router.patch('/:id', updatePage);
router.delete('/:id', deletePage);
router.post('/:id/submit', submitPage);
router.post('/:id/approve', requireRole('admin'), approvePage);
router.post('/:id/reject', requireRole('admin'), rejectPage);

export default router;
