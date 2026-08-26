import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import lectureRoutes from './routes/lecture.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import paymentRoutes from './routes/payment.routes';
import chatbotRoutes from './routes/chatbot.routes';

const app = express();

// ─────────────────────────────────────────
// Core Middleware
// ─────────────────────────────────────────

app.use(cors({
  origin: env.NODE_ENV === 'development' ? true : env.FRONTEND_URL,
  credentials: true,
}));

// NOTE: Razorpay webhook needs raw body — mount BEFORE express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
// Health Check (public, no auth middleware needed)
// ─────────────────────────────────────────

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Clerk middleware — makes req.auth available on all routes
app.use(clerkMiddleware());

// ─────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chatbot', chatbotRoutes);

// ─────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────

app.use((_, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─────────────────────────────────────────
// Global Error Handler (must be last)
// ─────────────────────────────────────────

app.use(errorHandler);

export default app;
