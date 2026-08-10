import { Router } from 'express';
import {
  createCustomComponent,
  listCustomComponents,
  getCustomComponent,
  updateCustomComponentMetadata,
  deleteCustomComponent
} from '../controllers/customComponent.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole('user-developer'));

router.post('/', createCustomComponent);
router.get('/', listCustomComponents);
router.get('/:id', getCustomComponent);
router.patch('/:id', updateCustomComponentMetadata);
router.delete('/:id', deleteCustomComponent);

export default router;
