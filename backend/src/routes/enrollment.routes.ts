import { Router } from 'express';
import {
  enrollFree,
  getMyEnrollments,
  updateProgress,
  completeLecture,
} from '../controllers/enrollment.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/free/:courseId', requireAuth, enrollFree);
router.get('/my-courses', requireAuth, getMyEnrollments);
router.patch('/:enrollmentId/progress', requireAuth, updateProgress);
router.post('/:enrollmentId/lecture/:lectureId/complete', requireAuth, completeLecture);

export default router;
