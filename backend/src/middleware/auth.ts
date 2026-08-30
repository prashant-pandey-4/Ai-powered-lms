import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from './errorHandler';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { clerkClient, getAuth } from '@clerk/express';

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
 * Verifies Clerk JWT and attaches Postgres user to req.dbUser.
 * If user is logged in via Clerk but not yet synced to Postgres,
 * automatically fetches their profile from Clerk and upserts into DB.
 */
export const requireAuth = [
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const clerkId = auth?.userId || (req as any).auth?.userId;

      if (!clerkId) {
        return next(new AppError('Unauthorized: Please sign in', 401));
      }

      let dbUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, clerkId: true, email: true, name: true, role: true },
      });

      // If user not yet in DB (e.g. localhost where webhooks don't trigger), auto-sync from Clerk
      if (!dbUser) {
        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);
          const email =
            clerkUser.emailAddresses?.find((e: any) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
            clerkUser.emailAddresses?.[0]?.emailAddress ||
            '';
          const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || clerkUser.username || null;
          const avatarUrl = clerkUser.imageUrl || null;

          const isAdmin = email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();

          dbUser = await prisma.user.upsert({
            where: { clerkId },
            update: {
              email,
              name,
              avatarUrl,
              ...(isAdmin ? { role: Role.ADMIN } : {}),
            },
            create: {
              clerkId,
              email,
              name,
              avatarUrl,
              role: isAdmin ? Role.ADMIN : Role.STUDENT,
            },
            select: { id: true, clerkId: true, email: true, name: true, role: true },
          });
        } catch (fetchErr: any) {
          console.error('Failed to auto-sync Clerk user to DB:', fetchErr);
          return next(new AppError('User not found in database and Clerk sync failed.', 401));
        }
      }

      // Auto-grant ADMIN role if email matches admin email
      if (
        dbUser &&
        dbUser.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase() &&
        dbUser.role !== Role.ADMIN
      ) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { role: Role.ADMIN },
          select: { id: true, clerkId: true, email: true, name: true, role: true },
        });
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
