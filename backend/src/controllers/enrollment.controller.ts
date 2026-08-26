import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * POST /api/enrollment/free/:courseId — Enroll in a free course
 */
export const enrollFree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = String(req.params.courseId);
    const userId = req.dbUser!.id;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError('Course not found', 404);
    if (!course.isPublished) throw new AppError('Course is not available', 400);
    if (course.price > 0) throw new AppError('This is a paid course. Please purchase it.', 400);

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
      return res.json({ success: true, data: existing, message: 'Already enrolled' });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
    });

    return res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/enrollment/my-courses — Get all courses student is enrolled in
 */
export const getMyEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.dbUser!.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { select: { name: true, avatarUrl: true } },
            _count: { select: { lectures: true } },
          },
        },
        lectureCompletions: { select: { lectureId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: enrollments });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/enrollment/:enrollmentId/progress — Recalculate progress
 */
export const updateProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollmentId = String(req.params.enrollmentId);
    const userId = req.dbUser!.id;

    const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment) throw new AppError('Enrollment not found', 404);
    if (enrollment.userId !== userId) throw new AppError('Forbidden', 403);

    const totalLectures = await prisma.lecture.count({
      where: { courseId: enrollment.courseId },
    });

    const completedLectures = await prisma.lectureCompletion.count({
      where: { enrollmentId },
    });

    const progress = totalLectures > 0
      ? Math.round((completedLectures / totalLectures) * 100)
      : 0;

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        completedAt: progress === 100 ? new Date() : null,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/enrollment/:enrollmentId/lecture/:lectureId/complete
 */
export const completeLecture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollmentId = String(req.params.enrollmentId);
    const lectureId = String(req.params.lectureId);
    const userId = req.dbUser!.id;

    const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment) throw new AppError('Enrollment not found', 404);
    if (enrollment.userId !== userId) throw new AppError('Forbidden', 403);

    // Upsert — idempotent (calling twice is safe)
    await prisma.lectureCompletion.upsert({
      where: { enrollmentId_lectureId: { enrollmentId, lectureId } },
      create: { enrollmentId, lectureId },
      update: {},
    });

    // Recalculate progress
    const totalLectures = await prisma.lecture.count({
      where: { courseId: enrollment.courseId },
    });
    const completedLectures = await prisma.lectureCompletion.count({ where: { enrollmentId } });
    const progress = totalLectures > 0
      ? Math.round((completedLectures / totalLectures) * 100)
      : 0;

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        completedAt: progress === 100 ? new Date() : null,
      },
    });

    return res.json({ success: true, message: 'Lecture marked complete', progress });
  } catch (error) {
    return next(error);
  }
};
