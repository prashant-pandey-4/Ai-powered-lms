import { Request, Response, NextFunction } from 'express';
import { uploadMedia } from '../config/cloudinary';
import { AppError } from '../middleware/errorHandler';

/**
 * POST /api/upload — Upload Image, Video, or Document
 */
export const handleUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No file provided for upload', 400);
    }

    const folder = (req.body.folder as string) || 'lms_uploads';
    const result = await uploadMedia(req.file, folder);

    return res.status(200).json({
      success: true,
      data: {
        url: result.url,
        resourceType: result.resourceType,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    return next(error);
  }
};
