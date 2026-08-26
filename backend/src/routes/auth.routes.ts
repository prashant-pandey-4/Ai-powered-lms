import { Router } from 'express';
import { syncUser } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/sync — Called by Clerk webhook on user.created
router.post('/sync', syncUser);

export default router;
