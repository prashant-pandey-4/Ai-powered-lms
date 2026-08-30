import { Router } from 'express';
import {
  addLecture,
  updateLecture,
  deleteLecture,
  reorderLectures,
} from '../controllers/lecture.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// All lecture management is admin-only
router.post('/course/:courseId', requireAuth, requireRole('ADMIN'), addLecture);
router.patch('/:id', requireAuth, requireRole('ADMIN'), updateLecture);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteLecture);
router.post('/course/:courseId/reorder', requireAuth, requireRole('ADMIN'), reorderLectures);

export default router;
