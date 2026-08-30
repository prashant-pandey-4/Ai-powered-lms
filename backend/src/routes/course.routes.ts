import { Router } from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
} from '../controllers/course.controller';
import {
  previewPlaylist,
  importPlaylist,
} from '../controllers/playlist.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Admin-only management routes
router.post('/', requireAuth, requireRole('ADMIN'), createCourse);
router.patch('/:id', requireAuth, requireRole('ADMIN'), updateCourse);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteCourse);
router.post('/:id/publish', requireAuth, requireRole('ADMIN'), publishCourse);

// 1-Click YouTube Playlist Importer routes
router.post('/preview-playlist', requireAuth, requireRole('ADMIN'), previewPlaylist);
router.post('/:courseId/import-playlist', requireAuth, requireRole('ADMIN'), importPlaylist);

export default router;
