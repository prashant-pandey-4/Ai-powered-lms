import { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';

// Lazy initialization — avoids crash when RAZORPAY keys are placeholder
function getRazorpay() {
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order for a paid course
 */
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.body;
    const userId = req.dbUser!.id;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError('Course not found', 404);
    if (!course.isPublished) throw new AppError('Course not available', 400);
    if (course.price === 0) throw new AppError('This is a free course. Enroll directly.', 400);

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existingEnrollment) {
      throw new AppError('Already enrolled in this course', 400);
    }

    // Create Razorpay order (amount in paise = price * 100)
  const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(course.price * 100),
      currency: 'INR',
      notes: { userId, courseId },
    });

    // Save pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        courseId,
        amount: course.price,
        razorpayOrderId: razorpayOrder.id,
        status: 'PENDING',
      },
    });

    return res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: env.RAZORPAY_KEY_ID,
        paymentId: payment.id,
        courseName: course.title,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/payment/webhook
 * Razorpay webhook — verifies HMAC signature, then enrolls student
 * IMPORTANT: This route receives raw body (configured in app.ts)
 */
export const verifyWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = req.body as Buffer;

    // HMAC verification
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody.toString());

    if (event.event === 'payment.captured') {
      const { order_id, id: razorpayPaymentId, notes } = event.payload.payment.entity;
      const { userId, courseId } = notes;

      // Use a transaction to update payment + create enrollment atomically
      await prisma.$transaction(async (tx) => {
        // Update payment status
        await tx.payment.update({
          where: { razorpayOrderId: order_id },
          data: {
            status: 'SUCCESS',
            razorpayPaymentId,
          },
        });

        // Create enrollment
        await tx.enrollment.upsert({
          where: { userId_courseId: { userId, courseId } },
          create: { userId, courseId },
          update: {},
        });
      });
    }

    if (event.event === 'payment.failed') {
      const { order_id } = event.payload.payment.entity;
      await prisma.payment.update({
        where: { razorpayOrderId: order_id },
        data: { status: 'FAILED' },
      });
    }

    return res.json({ received: true });
  } catch (error) {
    return next(error);
  }
};
