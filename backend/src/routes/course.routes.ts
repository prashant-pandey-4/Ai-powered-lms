import { Router } from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
} from '../controllers/course.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Instructor-only routes
router.post('/', requireAuth, requireRole('INSTRUCTOR', 'ADMIN'), createCourse);
router.patch('/:id', requireAuth, requireRole('INSTRUCTOR', 'ADMIN'), updateCourse);
router.delete('/:id', requireAuth, requireRole('INSTRUCTOR', 'ADMIN'), deleteCourse);
router.post('/:id/publish', requireAuth, requireRole('INSTRUCTOR', 'ADMIN'), publishCourse);

export default router;
