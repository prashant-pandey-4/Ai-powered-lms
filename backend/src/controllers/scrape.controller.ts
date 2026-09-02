import { Request, Response } from 'express';
import * as cheerio from 'cheerio';

/**
 * POST /api/scrape
 * Body: { url: string }
 *
 * Fetches any public article/blog URL and extracts:
 *  - title, summary/description, body content (cleaned text), cover image, tags, category hints
 *
 * Uses native fetch + cheerio for lightweight HTML parsing.
 */
export const scrapeArticle = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid URL to scrape.',
      });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format. Must start with http:// or https://',
      });
    }

    // ── Fetch the page HTML ──────────────────────────────────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    let html: string;
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!response.ok) {
        clearTimeout(timeout);
        return res.status(502).json({
          success: false,
          message: `Failed to fetch the URL. Server responded with ${response.status} ${response.statusText}`,
        });
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
        clearTimeout(timeout);
        return res.status(400).json({
          success: false,
          message: 'The URL does not point to an HTML page. Only article/blog pages can be scraped.',
        });
      }

      html = await response.text();
      clearTimeout(timeout);
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      if (fetchErr.name === 'AbortError') {
        return res.status(504).json({
          success: false,
          message: 'Request timed out after 15 seconds. The target site may be slow or blocking requests.',
        });
      }
      return res.status(502).json({
        success: false,
        message: `Could not reach the URL: ${fetchErr.message}`,
      });
    }

    // ── Parse with Cheerio ───────────────────────────────────────────────────
    const $ = cheerio.load(html);

    // Remove noise elements
    $('script, style, nav, header, footer, iframe, noscript, [role="navigation"], [role="banner"], .sidebar, .comments, .advertisement, .ad, #comments, .nav, .footer, .header, .menu').remove();

    // ── Extract Title ────────────────────────────────────────────────────────
    const title =
      $('meta[property="og:title"]').attr('content')?.trim() ||
      $('meta[name="twitter:title"]').attr('content')?.trim() ||
      $('h1').first().text().trim() ||
      $('title').text().trim() ||
      '';

    // ── Extract Description / Summary ────────────────────────────────────────
    const summary =
      $('meta[property="og:description"]').attr('content')?.trim() ||
      $('meta[name="description"]').attr('content')?.trim() ||
      $('meta[name="twitter:description"]').attr('content')?.trim() ||
      // Fallback: first <p> longer than 50 chars
      (() => {
        let fallback = '';
        $('p').each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 50 && !fallback) {
            fallback = text.substring(0, 300);
          }
        });
        return fallback;
      })() ||
      '';

    // ── Extract Cover Image ──────────────────────────────────────────────────
    let coverImage =
      $('meta[property="og:image"]').attr('content')?.trim() ||
      $('meta[name="twitter:image"]').attr('content')?.trim() ||
      $('meta[property="og:image:url"]').attr('content')?.trim() ||
      '';

    // Resolve relative URLs
    if (coverImage && !coverImage.startsWith('http')) {
      try {
        coverImage = new URL(coverImage, url).href;
      } catch {
        coverImage = '';
      }
    }

    // ── Extract Main Body Content ────────────────────────────────────────────
    // Try common article content selectors first, then fallback
    const articleSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.content',
      '.blog-content',
      '.markdown-body',
      '.post-body',
      '#content',
      '.story-body',
    ];

    let contentHtml = '';
    for (const selector of articleSelectors) {
      const el = $(selector).first();
      if (el.length && el.text().trim().length > 100) {
        contentHtml = el.html() || '';
        break;
      }
    }

    // Fallback: grab all <p> tags from body
    if (!contentHtml) {
      const paragraphs: string[] = [];
      $('body p').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 30) {
          paragraphs.push(text);
        }
      });
      contentHtml = paragraphs.join('\n\n');
    }

    // ── Convert HTML body to clean readable text / pseudo-markdown ───────────
    let bodyText = '';
    if (contentHtml) {
      const $content = cheerio.load(contentHtml);

      const lines: string[] = [];

      $content('h1, h2, h3, h4, h5, h6, p, li, pre, code, blockquote').each((_, el) => {
        const tag = (el as any).tagName?.toLowerCase() || '';
        const text = $content(el).text().trim();

        if (!text) return;

        if (tag === 'h1') lines.push(`# ${text}`);
        else if (tag === 'h2') lines.push(`## ${text}`);
        else if (tag === 'h3') lines.push(`### ${text}`);
        else if (tag === 'h4') lines.push(`#### ${text}`);
        else if (tag === 'h5' || tag === 'h6') lines.push(`##### ${text}`);
        else if (tag === 'pre' || tag === 'code') {
          // If it's a code block, preserve as-is
          lines.push('```');
          lines.push(text);
          lines.push('```');
        } else if (tag === 'blockquote') {
          lines.push(`> ${text}`);
        } else if (tag === 'li') {
          lines.push(`- ${text}`);
        } else {
          lines.push(text);
        }
        lines.push(''); // blank line between elements
      });

      bodyText = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    // ── Extract Tags / Keywords ──────────────────────────────────────────────
    const rawKeywords =
      $('meta[name="keywords"]').attr('content')?.trim() ||
      $('meta[property="article:tag"]').attr('content')?.trim() ||
      '';

    const tags = rawKeywords
      ? rawKeywords
          .split(/[,;|]/)
          .map((t: string) => t.trim().toLowerCase())
          .filter((t: string) => t.length > 1 && t.length < 40)
          .slice(0, 10)
      : [];

    // ── Extract Category Hint ────────────────────────────────────────────────
    const category =
      $('meta[property="article:section"]').attr('content')?.trim() ||
      $('meta[property="article:category"]').attr('content')?.trim() ||
      '';

    // ── Extract Read Time Estimate ───────────────────────────────────────────
    const wordCount = bodyText.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    // ── Extract Author ───────────────────────────────────────────────────────
    const author =
      $('meta[name="author"]').attr('content')?.trim() ||
      $('meta[property="article:author"]').attr('content')?.trim() ||
      $('[rel="author"]').first().text().trim() ||
      '';

    // ── Extract Published Date ───────────────────────────────────────────────
    const publishedDate =
      $('meta[property="article:published_time"]').attr('content')?.trim() ||
      $('time').first().attr('datetime')?.trim() ||
      '';

    return res.json({
      success: true,
      data: {
        title,
        summary,
        content: bodyText,
        coverImage,
        tags: tags.join(', '),
        category,
        readTime,
        author,
        publishedDate,
        sourceUrl: url,
        wordCount,
      },
    });
  } catch (err: any) {
    console.error('Scrape error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during scraping.',
    });
  }
};
