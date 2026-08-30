import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const createBlogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  coverImage: z.string().url().optional().or(z.literal('')),
  category: z.string().default('General'),
  tags: z.array(z.string()).default([]),
  readTime: z.number().int().positive().default(5),
  isPublished: z.boolean().default(false),
});

/**
 * GET /api/blogs — Public: List published blog posts
 */
export const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, tag, search, all } = req.query;
    const isAdminQuery = all === 'true' && req.dbUser?.role === 'ADMIN';

    const posts = await prisma.blogPost.findMany({
      where: {
        ...(isAdminQuery ? {} : { isPublished: true }),
        ...(category && { category: String(category) }),
        ...(tag && { tags: { has: String(tag) } }),
        ...(search && {
          OR: [
            { title: { contains: String(search), mode: 'insensitive' } },
            { summary: { contains: String(search), mode: 'insensitive' } },
            { content: { contains: String(search), mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: posts });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/blogs/:slug — Public: Get single blog post by slug
 */
export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = String(req.params.slug);

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!post) {
      throw new AppError('Blog article not found', 404);
    }

    return res.json({ success: true, data: post });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/blogs — Admin: Create new blog article
 */
export const createBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createBlogSchema.parse(req.body);
    const authorId = req.dbUser!.id;

    let slug = slugify(validated.title);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        ...validated,
        slug,
        coverImage: validated.coverImage || null,
        authorId,
      },
    });

    return res.status(201).json({ success: true, data: post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.flatten().fieldErrors });
    }
    return next(error);
  }
};

/**
 * PATCH /api/blogs/:id — Admin: Update blog article
 */
export const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new AppError('Blog article not found', 404);

    const updateSchema = createBlogSchema.partial();
    const validated = updateSchema.parse(req.body);

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...validated,
        ...(validated.coverImage !== undefined && {
          coverImage: validated.coverImage || null,
        }),
      },
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
 * DELETE /api/blogs/:id — Admin: Delete blog article
 */
export const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new AppError('Blog article not found', 404);

    await prisma.blogPost.delete({ where: { id } });

    return res.json({ success: true, message: 'Blog article deleted' });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/blogs/:id/publish — Admin: Toggle publish status
 */
export const publishBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new AppError('Blog article not found', 404);

    const updated = await prisma.blogPost.update({
      where: { id },
      data: { isPublished: !post.isPublished },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};
