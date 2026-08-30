import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

/**
 * Build a grounded system prompt using course curriculum and the active lecture context
 */
async function buildCourseContext(courseId: string, activeLectureId?: string): Promise<string | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lectures: {
        orderBy: { order: 'asc' },
        select: { id: true, title: true, description: true, order: true },
      },
    },
  });

  if (!course) return null;

  const currentLecture = activeLectureId
    ? course.lectures.find((l) => l.id === activeLectureId)
    : undefined;

  const lectureList = course.lectures
    .map((l) => `  ${l.order}. ${l.title}${l.id === activeLectureId ? ' [CURRENT LESSON PLAYING]' : ''}`)
    .join('\n');

  return `You are a dedicated AI tutor for the course "${course.title}".
Your job is to explain concepts clearly, resolve student doubts, and teach with code examples and analogies.

=== COURSE OVERVIEW ===
Course: ${course.title}
Description: ${course.description || 'Comprehensive learning course.'}

=== CURRENT LESSON PLAYING ===
${
  currentLecture
    ? `Lesson ${currentLecture.order}: "${currentLecture.title}"
Lesson Description/Notes: ${currentLecture.description || 'Core concepts for this lecture.'}`
    : 'General course inquiry'
}

=== COMPLETE COURSE CURRICULUM ===
${lectureList || 'Sequential syllabus lessons.'}

=== TUTOR INSTRUCTIONS ===
1. The student is actively watching the CURRENT LESSON above. Prioritize answering with focus on this specific lesson's topic.
2. If the student asks about code, syntax, algorithms, or concepts in this video, give clear step-by-step explanations with easy-to-read code snippets.
3. If they ask about previous or upcoming topics in the syllabus, connect the concepts smoothly.
4. Keep answers pedagogical, encouraging, and concise.`;
}

/**
 * POST /api/chatbot/:courseId/ask
 */
export const askQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = String(req.params.courseId);
    const userId = req.dbUser?.id;

    if (!userId) {
      throw new AppError('Please sign in to ask the AI Tutor', 401);
    }

    const { question, lectureId } = z.object({
      question: z.string().min(2, 'Question too short').max(2000),
      lectureId: z.string().optional(),
    }).parse(req.body);

    // Build grounded course & active lecture context
    const systemContext = await buildCourseContext(courseId, lectureId);
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

${historyText ? `Previous conversation:\n${historyText}\n\n` : ''}Student question: ${question}

Provide an educational, clear, and well-structured answer tailored to this lecture:`;

    // Call Gemini API
    const result = await model.generateContent(fullPrompt);
    const answer = result.response.text();

    // Save to ChatLog
    await prisma.chatLog.create({
      data: { userId, courseId, question, answer },
    });

    return res.json({ success: true, data: { answer } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.flatten().fieldErrors });
    }
    console.error('AI Tutor error:', error);
    return next(new AppError(error?.message || 'Failed to generate AI response', 500));
  }
};

/**
 * GET /api/chatbot/:courseId/history
 */
export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = String(req.params.courseId);
    const userId = req.dbUser?.id;

    if (!userId) {
      return res.json({ success: true, data: [] });
    }

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
