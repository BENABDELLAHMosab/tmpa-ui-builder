import { Router } from 'express';
import { createPage, getPages, getPageById, updatePage, deletePage, submitPage, approvePage, rejectPage, publishPage, listPageVersions, getPageVersion, restorePageVersion } from '../controllers/page.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', createPage);
router.get('/', getPages);
router.get('/:id/versions', listPageVersions);
router.get('/:id/versions/:versionNumber', getPageVersion);
router.post('/:pageId/versions/:versionNumber/restore', restorePageVersion);
router.get('/:id', getPageById);
router.patch('/:id', updatePage);
router.delete('/:id', deletePage);
router.post('/:id/submit', submitPage);
router.post('/:id/approve', requireRole('admin'), approvePage);
router.post('/:id/reject', requireRole('admin'), rejectPage);
router.post('/:id/publish', requireRole('admin'), publishPage);

export default router;
