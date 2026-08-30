import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const lectureSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  videoUrl: z.string().url('Must be a valid YouTube URL'),
  pdfUrl: z.string().url().optional(),
  duration: z.number().int().positive().optional(),
  isFree: z.boolean().default(false),
});

/**
 * POST /api/lectures/course/:courseId — Admin: Add lecture to course
 */
export const addLecture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = String(req.params.courseId);

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError('Course not found', 404);

    const validated = lectureSchema.parse(req.body);

    // Auto-assign order (append to end)
    const lastLecture = await prisma.lecture.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
    });
    const order = (lastLecture?.order ?? 0) + 1;

    const lecture = await prisma.lecture.create({
      data: { ...validated, courseId, order },
    });

    return res.status(201).json({ success: true, data: lecture });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.flatten().fieldErrors });
    }
    return next(error);
  }
};

/**
 * PATCH /api/lectures/:id — Admin: Update lecture
 */
export const updateLecture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const lecture = await prisma.lecture.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!lecture) throw new AppError('Lecture not found', 404);

    const validated = lectureSchema.partial().parse(req.body);

    const updated = await prisma.lecture.update({
      where: { id },
      data: validated,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.flatten().fieldErrors });
    }
    return next(error);
  }
};

/**
 * DELETE /api/lectures/:id — Admin: Delete lecture
 */
export const deleteLecture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const lecture = await prisma.lecture.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!lecture) throw new AppError('Lecture not found', 404);

    await prisma.lecture.delete({ where: { id } });

    return res.json({ success: true, message: 'Lecture deleted' });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/lectures/course/:courseId/reorder — Admin: Reorder lectures
 * Body: { orderedIds: string[] }
 */
export const reorderLectures = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = String(req.params.courseId);
    const { orderedIds } = z.object({ orderedIds: z.array(z.string()) }).parse(req.body);

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError('Course not found', 404);

    await prisma.$transaction(
      orderedIds.map((lectureId, index) =>
        prisma.lecture.update({
          where: { id: lectureId },
          data: { order: index + 1 },
        })
      )
    );

    return res.json({ success: true, message: 'Lectures reordered' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.flatten().fieldErrors });
    }
    return next(error);
  }
};
