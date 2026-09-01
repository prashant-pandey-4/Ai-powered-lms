import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-3.6-flash',
  generationConfig: {
    maxOutputTokens: 650,
    temperature: 0.6,
  },
});

/**
 * Lightweight, ultra-fast prompt builder focused on active lecture
 */
async function buildCourseContext(courseId: string, activeLectureId?: string, studentName?: string): Promise<string | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      title: true,
      description: true,
      lectures: {
        where: activeLectureId ? { id: activeLectureId } : undefined,
        take: 1,
        select: { title: true, description: true, order: true },
      },
    },
  });

  if (!course) return null;

  const currentLecture = course.lectures?.[0];
  const name = studentName ? studentName.split(' ')[0] : 'there';

  return `You are a helpful and concise coding mentor for the course "${course.title}".
You are answering ${name}'s question.

Current Lesson: ${currentLecture ? `Lesson ${currentLecture.order}: ${currentLecture.title}` : course.title}

Instructions:
1. Speak naturally like a real developer / mentor.
2. Do NOT use excessive bold asterisks (**) or emoji spam. Keep text clean and readable.
3. If providing code, use standard code blocks with language tag.
4. Give direct, crisp, and helpful answers without fluff.`;
}

/**
 * POST /api/chatbot/:courseId/ask
 */
export const askQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = String(req.params.courseId);
    const userId = req.dbUser?.id;
    const studentName = req.dbUser?.name || 'Student';

    if (!userId) {
      throw new AppError('Please sign in to ask the AI Tutor', 401);
    }

    const { question, lectureId } = z.object({
      question: z.string().min(2, 'Question too short').max(2000),
      lectureId: z.string().optional(),
    }).parse(req.body);

    const systemContext = await buildCourseContext(courseId, lectureId, studentName);
    if (!systemContext) throw new AppError('Course not found', 404);

    // Get last 3 messages for conversational memory
    const history = await prisma.chatLog.findMany({
      where: { userId, courseId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    const historyText = history
      .reverse()
      .map((h) => `User: ${h.question}\nAssistant: ${h.answer}`)
      .join('\n\n');

    const fullPrompt = `${systemContext}

${historyText ? `Conversation history:\n${historyText}\n\n` : ''}User question: ${question}

Direct answer:`;

    // Call Gemini API
    const result = await model.generateContent(fullPrompt);
    let answer = result.response.text();

    // Clean up any remaining double asterisks if redundant
    answer = answer.replace(/\*\*(.*?)\*\*/g, '$1');

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
