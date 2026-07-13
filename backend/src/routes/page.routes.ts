import { Router } from 'express';
import { createPage, getPages, getPageById, updatePage, deletePage, submitPage } from '../controllers/page.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', createPage);
router.get('/', getPages);
router.get('/:id', getPageById);
router.patch('/:id', updatePage);
router.delete('/:id', deletePage);
router.post('/:id/submit', submitPage);

export default router;
