import { Router } from 'express';
import { createPage, getPages, getPageById, updatePage, deletePage, submitPage, updateReviewToLatest, approvePage, rejectPage, publishPage, listPageVersions, getPageVersion, restorePageVersion, deletePageVersion, dismissRejectionFeedback, listPageReviews } from '../controllers/page.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', createPage);
router.get('/', getPages);
router.get('/:id/versions', listPageVersions);
router.get('/:id/versions/:versionNumber', getPageVersion);
router.get('/:id/reviews', listPageReviews);
router.delete('/:id/versions/:versionNumber', deletePageVersion);
router.post('/:pageId/versions/:versionNumber/restore', restorePageVersion);
router.get('/:id', getPageById);
router.patch('/:id', updatePage);
router.delete('/:id', deletePage);
router.post('/:id/submit', submitPage);
router.post('/:id/reviews/update-to-latest', updateReviewToLatest);
router.patch('/:pageId/reviews/:reviewId/approve', requireRole('admin'), approvePage);
router.patch('/:pageId/reviews/:reviewId/request-changes', requireRole('admin'), rejectPage);
router.patch('/:id/rejection-feedback/dismiss', dismissRejectionFeedback);
router.post('/:id/publish', requireRole('admin'), publishPage);

export default router;
