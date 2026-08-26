import { Router } from 'express';
import {
  addLecture,
  updateLecture,
  deleteLecture,
  reorderLectures,
} from '../controllers/lecture.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// All lecture management is instructor-only
router.post('/course/:courseId', requireAuth, requireRole('INSTRUCTOR', 'ADMIN'), addLecture);
router.patch('/:id', requireAuth, requireRole('INSTRUCTOR', 'ADMIN'), updateLecture);
router.delete('/:id', requireAuth, requireRole('INSTRUCTOR', 'ADMIN'), deleteLecture);
router.post('/course/:courseId/reorder', requireAuth, requireRole('INSTRUCTOR', 'ADMIN'), reorderLectures);

export default router;
