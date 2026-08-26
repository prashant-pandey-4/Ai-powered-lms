import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Build a system prompt using the course's lecture titles/descriptions as context
 */
async function buildCourseContext(courseId: string): Promise<string | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lectures: {
        orderBy: { order: 'asc' },
        select: { title: true, description: true, order: true },
      },
    },
  });

  if (!course) return null;

  const lectureList = course.lectures
    .map((l) => `  ${l.order}. ${l.title}${l.description ? ': ' + l.description : ''}`)
    .join('\n');

  return `You are an AI tutor for the course "${course.title}".
Your job is to help students understand the course content better.
Only answer questions related to the following course topics:

Course: ${course.title}
Description: ${course.description}

Lectures covered:
${lectureList}

Rules:
- Stay strictly on-topic with the course content above.
- If a question is unrelated, politely say you can only help with this course's topics.
- Give clear, concise, educational explanations.
- Use examples when helpful.`;
}

/**
 * POST /api/chatbot/:courseId/ask
 */
export const askQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = String(req.params.courseId);
    const userId = req.dbUser!.id;

    const { question } = z.object({
      question: z.string().min(3).max(1000),
    }).parse(req.body);

    // Verify student is enrolled
    if (req.dbUser!.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });
      if (!enrollment) {
        throw new AppError('You must be enrolled to use the AI chatbot', 403);
      }
    }

    // Build course context
    const systemContext = await buildCourseContext(courseId);
    if (!systemContext) throw new AppError('Course not found', 404);

    // Get last 5 messages for conversational context
    const history = await prisma.chatLog.findMany({
      where: { userId, courseId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const historyText = history
      .reverse()
      .map((h) => `Student: ${h.question}\nTutor: ${h.answer}`)
      .join('\n\n');

    const fullPrompt = `${systemContext}

${historyText ? `Previous conversation:\n${historyText}\n\n` : ''}Student question: ${question}`;

    // Call Gemini API
    const result = await model.generateContent(fullPrompt);
    const answer = result.response.text();

    // Save to ChatLog
    await prisma.chatLog.create({
      data: { userId, courseId, question, answer },
    });

    return res.json({ success: true, data: { answer } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.flatten().fieldErrors });
    }
    return next(error);
  }
};

/**
 * GET /api/chatbot/:courseId/history
 */
export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = String(req.params.courseId);
    const userId = req.dbUser!.id;

    const logs = await prisma.chatLog.findMany({
      where: { userId, courseId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    return res.json({ success: true, data: logs });
  } catch (error) {
    return next(error);
  }
};
