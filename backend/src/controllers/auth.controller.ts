import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { Webhook } from 'svix';
import { env } from '../config/env';
import { Role } from '@prisma/client';

/**
 * POST /api/auth/sync
 * Clerk webhook — syncs user to Postgres on user.created / user.updated
 */
export const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = JSON.stringify(req.body);
    const headers = req.headers as Record<string, string>;

    // Verify the webhook came from Clerk using svix
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
    let evt: any;
    try {
      evt = wh.verify(payload, headers);
    } catch {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address ?? '';
    const name = [first_name, last_name].filter(Boolean).join(' ') || null;

    if (evt.type === 'user.created') {
      await prisma.user.create({
        data: {
          clerkId,
          email,
          name,
          avatarUrl: image_url ?? null,
          role:
            email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()
              ? Role.ADMIN
              : Role.STUDENT,
        },
      });
    } else if (evt.type === 'user.updated') {
      await prisma.user.update({
        where: { clerkId },
        data: { email, name, avatarUrl: image_url ?? null },
      });
    } else if (evt.type === 'user.deleted') {
      await prisma.user.delete({ where: { clerkId } });
    }

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};
