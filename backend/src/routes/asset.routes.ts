import { Router } from 'express';
import multer from 'multer';
import { uploadAsset, getAsset } from '../controllers/asset.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
});

router.use(authenticateJWT);

router.post('/images', upload.single('image'), uploadAsset);
router.get('/:id', getAsset);

export default router;
