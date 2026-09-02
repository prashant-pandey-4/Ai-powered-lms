import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { scrapeArticle } from '../controllers/scrape.controller';

const router = Router();

// POST /api/scrape — scrape an article from any public URL
// Protected: only authenticated admin users should use this
router.post('/', requireAuth(), scrapeArticle as any);

export default router;
