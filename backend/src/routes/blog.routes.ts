import { Router } from 'express';
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
} from '../controllers/blog.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// Admin-only routes
router.post('/', requireAuth, requireRole('ADMIN'), createBlog);
router.patch('/:id', requireAuth, requireRole('ADMIN'), updateBlog);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteBlog);
router.post('/:id/publish', requireAuth, requireRole('ADMIN'), publishBlog);

export default router;
