import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Ensure local uploads directory exists as fallback
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export interface UploadResult {
  url: string;
  publicId?: string;
  format?: string;
  bytes?: number;
  resourceType: 'image' | 'video' | 'raw' | 'auto';
}

/**
 * Upload buffer or file path to Cloudinary (if configured) or local storage fallback
 */
export async function uploadMedia(
  file: Express.Multer.File,
  folder = 'lms_uploads'
): Promise<UploadResult> {
  const isVideo = file.mimetype.startsWith('video/');
  const isImage = file.mimetype.startsWith('image/');
  const resourceType: 'image' | 'video' | 'raw' | 'auto' = isVideo
    ? 'video'
    : isImage
    ? 'image'
    : 'raw';

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            resourceType,
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  // Local Storage Fallback
  const ext = path.extname(file.originalname) || (isImage ? '.jpg' : isVideo ? '.mp4' : '.pdf');
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, file.buffer);

  const serverUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const url = `${serverUrl}/uploads/${filename}`;

  return {
    url,
    format: ext.replace('.', ''),
    bytes: file.size,
    resourceType,
  };
}
