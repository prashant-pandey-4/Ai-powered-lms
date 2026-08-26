import { Router } from 'express';
import { askQuestion, getChatHistory } from '../controllers/chatbot.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All chatbot endpoints require auth
router.post('/:courseId/ask', requireAuth, askQuestion);
router.get('/:courseId/history', requireAuth, getChatHistory);

export default router;
