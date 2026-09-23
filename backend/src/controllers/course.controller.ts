import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const lectureInputSchema = z.object({
  title: z.string().min(1, 'Lecture title required'),
  description: z.string().optional().default(''),
  videoUrl: z.string().min(1, 'Video URL required'),
  duration: z.number().default(600),
  isFree: z.boolean().default(true),
  pdfUrl: z.string().optional(),
});

const createCourseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.string().optional(),
  language: z.string().default('English / Hindi'),
  isPublished: z.boolean().default(true),
  lectures: z.array(lectureInputSchema).optional(),
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

    const searchTerm = search ? String(search).trim() : '';

    const executeFindCourses = async () => {
      return prisma.course.findMany({
        where: {
          isPublished: true,
          ...(category && { category: String(category) }),
          ...(level && { level: String(level) }),
          ...(searchTerm && {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
              { category: { contains: searchTerm, mode: 'insensitive' } },
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
    };

    // Resilient Neon cold-start retry
    let courses;
    try {
      courses = await executeFindCourses();
    } catch (err: any) {
      if (err?.message?.includes('database server') || err?.code === 'P1001') {
        await new Promise((r) => setTimeout(r, 800));
        courses = await executeFindCourses();
      } else {
        throw err;
      }
    }

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
    const { lectures, ...courseData } = createCourseSchema.parse(req.body);
    const instructorId = req.dbUser!.id;

    const course = await prisma.course.create({
      data: {
        ...courseData,
        instructorId,
        isPublished: true, // Auto-publish course
        ...(lectures && lectures.length > 0
          ? {
              lectures: {
                create: lectures.map((lec, idx) => ({
                  title: lec.title || `Episode ${idx + 1}`,
                  description: lec.description || '',
                  videoUrl: lec.videoUrl,
                  duration: lec.duration || 600,
                  order: idx + 1,
                  isFree: idx === 0 || lec.isFree,
                  pdfUrl: lec.pdfUrl,
                })),
              },
            }
          : {}),
      },
      include: {
        lectures: true,
        _count: { select: { lectures: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Course and lectures created successfully!',
      data: course,
    });
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
    const { lectures, ...courseData } = validated;

    const updated = await prisma.course.update({
      where: { id },
      data: courseData,
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
