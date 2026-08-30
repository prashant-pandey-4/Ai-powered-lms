import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import path from 'path';

// Route imports
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import lectureRoutes from './routes/lecture.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import chatbotRoutes from './routes/chatbot.routes';
import uploadRoutes from './routes/upload.routes';
import blogRoutes from './routes/blog.routes';

const app = express();

// Serve local uploads folder statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─────────────────────────────────────────
// Core Middleware
// ─────────────────────────────────────────

app.use(cors({
  origin: env.NODE_ENV === 'development' ? true : env.FRONTEND_URL,
  credentials: true,
}));

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
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/blogs', blogRoutes);

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
