import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import https from 'https';
import { z } from 'zod';

function extractPlaylistId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{12,}$/.test(trimmed) && !trimmed.includes('http')) {
    return trimmed;
  }
  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

interface ParsedVideo {
  videoId: string;
  title: string;
  durationFormatted: string;
  duration: number;
  thumbnail: string;
}

interface ParsedPlaylist {
  title: string;
  videos: ParsedVideo[];
}

/**
 * Robust native YouTube Playlist scraper that parses YouTube's lockupViewModel / playlistVideoRenderer
 * without depending on broken 3rd-party npm packages.
 */
function fetchYouTubePlaylist(listId: string): Promise<ParsedPlaylist> {
  return new Promise((resolve, reject) => {
    const url = `https://www.youtube.com/playlist?list=${listId}&hl=en`;
    https
      .get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              const prefix = 'var ytInitialData = ';
              const idx = body.indexOf(prefix);

              if (idx === -1) {
                return reject(
                  new AppError(
                    'Could not load YouTube playlist. Please check if the playlist is Public or Unlisted.',
                    404
                  )
                );
              }

              const start = idx + prefix.length;
              const end = body.indexOf(';</script>', start);
              const jsonStr = body
                .substring(start, end !== -1 ? end : body.indexOf('</script>', start))
                .trim();

              const data = JSON.parse(jsonStr.endsWith(';') ? jsonStr.slice(0, -1) : jsonStr);

              const title =
                data.metadata?.playlistMetadataRenderer?.title ||
                data.header?.playlistHeaderRenderer?.title?.simpleText ||
                'YouTube Playlist Series';

              const videos: ParsedVideo[] = [];

              function walk(obj: any) {
                if (!obj || typeof obj !== 'object') return;

                // Modern 2025/2026 YouTube lockupViewModel
                if (obj.lockupViewModel && obj.lockupViewModel.contentId) {
                  const l = obj.lockupViewModel;
                  const videoId = l.contentId;
                  const vTitle = l.metadata?.lockupMetadataViewModel?.title?.content || 'Untitled Lesson';

                  let durationFormatted = '10:00';
                  let duration = 600;

                  const overlays = l.contentImage?.thumbnailViewModel?.overlays || [];
                  for (const ov of overlays) {
                    const badgeText =
                      ov.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel?.text;
                    if (badgeText && /^\d+:\d+/.test(badgeText)) {
                      durationFormatted = badgeText;
                      duration = badgeText.split(':').reduce((acc: number, t: string) => 60 * acc + +t, 0) || 600;
                      break;
                    }
                  }

                  if (!videos.some((v) => v.videoId === videoId)) {
                    videos.push({
                      videoId,
                      title: vTitle,
                      durationFormatted,
                      duration,
                      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    });
                  }
                  return;
                }

                // Legacy playlistVideoRenderer fallback
                if (obj.playlistVideoRenderer && obj.playlistVideoRenderer.videoId) {
                  const p = obj.playlistVideoRenderer;
                  const videoId = p.videoId;
                  const vTitle = p.title?.runs?.[0]?.text || p.title?.simpleText || 'Untitled Lesson';
                  const lengthText = p.lengthText?.simpleText || '10:00';
                  const duration =
                    lengthText.split(':').reduce((acc: number, t: string) => 60 * acc + +t, 0) || 600;

                  if (!videos.some((v) => v.videoId === videoId)) {
                    videos.push({
                      videoId,
                      title: vTitle,
                      durationFormatted: lengthText,
                      duration,
                      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    });
                  }
                  return;
                }

                for (const key of Object.keys(obj)) {
                  walk(obj[key]);
                }
              }

              walk(data);

              if (videos.length === 0) {
                return reject(
                  new AppError(
                    'No videos found in this playlist. Please verify the playlist is not empty or private.',
                    404
                  )
                );
              }

              resolve({ title, videos });
            } catch (err: any) {
              reject(new AppError(`Failed to parse YouTube playlist: ${err.message}`, 500));
            }
          });
        }
      )
      .on('error', (err) => {
        reject(new AppError(`Network error connecting to YouTube: ${err.message}`, 500));
      });
  });
}

const importPlaylistSchema = z.object({
  playlistUrl: z.string().min(5, 'Valid YouTube playlist URL required'),
  isFreeFirstLecture: z.boolean().default(true),
});

/**
 * POST /api/courses/preview-playlist
 * Preview videos before importing into course
 */
export const previewPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { playlistUrl } = importPlaylistSchema.parse(req.body);
    const listId = extractPlaylistId(playlistUrl);

    if (!listId) {
      throw new AppError('Could not extract valid playlist ID from URL', 400);
    }

    const playlist = await fetchYouTubePlaylist(listId);

    const videosWithOrder = playlist.videos.map((v, index) => ({
      order: index + 1,
      title: v.title,
      videoId: v.videoId,
      videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
      duration: v.duration,
      durationFormatted: v.durationFormatted,
      thumbnail: v.thumbnail,
    }));

    return res.json({
      success: true,
      data: {
        title: playlist.title,
        videoCount: videosWithOrder.length,
        videos: videosWithOrder,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/courses/:courseId/import-playlist
 * Batch insert all playlist videos as sequential lectures
 */
export const importPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = String(req.params.courseId);
    const { playlistUrl, isFreeFirstLecture } = importPlaylistSchema.parse(req.body);

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError('Course not found', 404);

    const listId = extractPlaylistId(playlistUrl);
    if (!listId) {
      throw new AppError('Could not extract valid playlist ID from URL', 400);
    }

    const playlist = await fetchYouTubePlaylist(listId);

    // Determine starting order index
    const lastLecture = await prisma.lecture.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
    });
    const currentOrder = (lastLecture?.order ?? 0) + 1;
    const lecturesData = playlist.videos.map((v, i) => ({
      courseId,
      title: v.title || `Lecture ${currentOrder + i}`,
      videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
      duration: v.duration || 300,
      order: currentOrder + i,
      isFree: i === 0 && isFreeFirstLecture,
      description: `Imported from YouTube Playlist: ${playlist.title || 'Course Series'}`,
    }));

    await prisma.lecture.createMany({
      data: lecturesData,
    });

    // Auto-set course thumbnail from 1st video if course has no custom thumbnail
    if (!course.thumbnail && playlist.videos[0]?.thumbnail) {
      await prisma.course.update({
        where: { id: courseId },
        data: { thumbnail: playlist.videos[0].thumbnail },
      });
    }

    const createdLectures = await prisma.lecture.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });

    return res.status(201).json({
      success: true,
      message: `Successfully imported ${lecturesData.length} lessons into course!`,
      data: createdLectures,
    });
  } catch (error) {
    return next(error);
  }
};
