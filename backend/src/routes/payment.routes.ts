import { Router } from 'express';
import { createOrder, verifyWebhook } from '../controllers/payment.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Create Razorpay order (authenticated)
router.post('/create-order', requireAuth, createOrder);

// Webhook — raw body, no auth (verified via HMAC signature)
router.post('/webhook', verifyWebhook);

export default router;
