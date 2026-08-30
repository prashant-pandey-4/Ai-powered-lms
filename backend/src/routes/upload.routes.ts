import { Router } from 'express';
import multer from 'multer';
import { handleUpload } from '../controllers/upload.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max
  },
});

// Admin-only upload endpoint
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  upload.single('file'),
  handleUpload
);

export default router;
