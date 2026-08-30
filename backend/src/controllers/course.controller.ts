import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const createCourseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.string().optional(),
  language: z.string().default('English'),
  // Platform is free — price is always 0, ignored from client input
  price: z.number().default(0).transform(() => 0),
});

function extractYouTubeThumb(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

/**
 * GET /api/courses — Public: List all published courses
 */
export const getCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, level, search } = req.query;

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(category && { category: String(category) }),
        ...(level && { level: String(level) }),
        ...(search && {
          OR: [
            { title: { contains: String(search), mode: 'insensitive' } },
            { description: { contains: String(search), mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        lectures: {
          take: 1,
          orderBy: { order: 'asc' },
          select: { videoUrl: true },
        },
        _count: { select: { lectures: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = courses.map((c) => ({
      ...c,
      thumbnail: c.thumbnail || extractYouTubeThumb(c.lectures?.[0]?.videoUrl) || null,
    }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/courses/:id — Public: Get course details + lectures
 */
export const getCourseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        lectures: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            videoUrl: true,
            duration: true,
            order: true,
            isFree: true,
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const formatted = {
      ...course,
      thumbnail: course.thumbnail || extractYouTubeThumb(course.lectures?.[0]?.videoUrl) || null,
    };

    return res.json({ success: true, data: formatted });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/courses — Admin: Create a new course
 */
export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createCourseSchema.parse(req.body);
    const instructorId = req.dbUser!.id;

    const course = await prisma.course.create({
      data: {
        ...validated,
        instructorId,
      },
    });

    return res.status(201).json({ success: true, data: course });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.flatten().fieldErrors });
    }
    return next(error);
  }
};

/**
 * PATCH /api/courses/:id — Admin: Update course
 */
export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new AppError('Course not found', 404);

    const updateSchema = createCourseSchema.partial();
    const validated = updateSchema.parse(req.body);

    const updated = await prisma.course.update({
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
 * DELETE /api/courses/:id — Admin: Delete course
 */
export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new AppError('Course not found', 404);

    await prisma.course.delete({ where: { id } });

    return res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/courses/:id/publish — Admin: Toggle publish status
 */
export const publishCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const course = await prisma.course.findUnique({
      where: { id },
      include: { _count: { select: { lectures: true } } },
    });
    if (!course) throw new AppError('Course not found', 404);

    if (!course.isPublished && course._count.lectures === 0) {
      throw new AppError('Cannot publish a course with no lectures', 400);
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { isPublished: !course.isPublished },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};
