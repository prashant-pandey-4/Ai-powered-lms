import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from './errorHandler';
import { Role } from '@prisma/client';

// Extend Express Request to include our custom user
declare global {
  namespace Express {
    interface Request {
      dbUser?: {
        id: string;
        clerkId: string;
        email: string;
        name: string | null;
        role: Role;
      };
    }
  }
}

/**
 * Verifies Clerk JWT and attaches Postgres user to req.dbUser
 */
export const requireAuth = [
  // Step 1: Check if globally verified Clerk ID is present (via clerkMiddleware in app.ts)
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clerkId = (req as any).auth?.userId;
      if (!clerkId) {
        return next(new AppError('Unauthorized', 401));
      }

      const dbUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, clerkId: true, email: true, name: true, role: true },
      });

      if (!dbUser) {
        return next(new AppError('User not found in database. Please complete signup.', 404));
      }

      req.dbUser = dbUser;
      return next();
    } catch (error) {
      return next(error);
    }
  },
];

/**
 * Role-based access control guard
 * Must be used AFTER requireAuth
 */
export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.dbUser) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!roles.includes(req.dbUser.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }

    return next();
  };
};
