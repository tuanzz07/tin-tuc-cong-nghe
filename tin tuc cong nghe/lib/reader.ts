/**
 * lib/reader.ts
 * Module trích xuất nội dung bài viết dạng Reader Mode.
 *
 * Reader Mode lấy trang web gốc, loại bỏ quảng cáo và
 * định dạng lại để dễ đọc hơn.
 * Sử dụng node-html-parser (lightweight) để phân tích HTML.
 */

import { parse as parseHtml } from 'node-html-parser';
import type { ReaderContent } from './types';

// ===========================
// DANH SÁCH SELECTOR CẦN XÓA
// ===========================

// Các phần tử HTML không liên quan đến nội dung chính
const REMOVE_SELECTORS = [
  'script',        // JavaScript
  'style',         // CSS inline
  'nav',           // Thanh điều hướng
  'header',        // Tiêu đề trang
  'footer',        // Chân trang
  'aside',         // Nội dung phụ/sidebar
  'iframe',        // Khung nhúng
  'noscript',      // Fallback JS
  '.ad',           // Quảng cáo
  '.ads',
  '.advertisement',
  '.adsbygoogle',
  '.banner',
  '.popup',
  '.modal',
  '.overlay',
  '.sidebar',
  '.widget',
  '.related-posts',
  '.related-articles',
  '.newsletter',
  '.subscribe',
  '.social-share',
  '.share-buttons',
  '.comments',
  '.comment-section',
  '#comments',
  '.breadcrumb',
  '.pagination',
  '.tags',
  '.tag-cloud',
  '[class*="sidebar"]',
  '[class*="related"]',
  '[class*="recommend"]',
  '[class*="popup"]',
  '[class*="modal"]',
  '[class*="cookie"]',
  '[class*="newsletter"]',
  '[id*="sidebar"]',
  '[id*="ad-"]',
  '[id*="-ad"]',
];

// Các selector cho phần nội dung chính (theo thứ tự ưu tiên)
const CONTENT_SELECTORS = [
  'article',
  '[role="main"]',
  'main',
  '.article-body',
  '.article-content',
  '.article__body',
  '.article__content',
  '.entry-content',
  '.entry-body',
  '.post-content',
  '.post-body',
  '.story-body',
  '.story-content',
  '.content-body',
  '.main-content',
  '.article-detail',
  '.detail-content',
  '#article-body',
  '#content',
  '#main-content',
  '.content',
  '.body-content',
];

// ===========================
// HÀM TRÍCH XUẤT NỘI DUNG
// ===========================

/**
 * Làm sạch HTML: loại bỏ các thuộc tính nguy hiểm và không cần thiết
 * Giữ lại các thẻ định dạng cơ bản (p, h1-h6, ul, ol, li, img, a, blockquote)
 */
function sanitizeHtml(html: string): string {
  return html
    // Xóa script tags và nội dung của chúng
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Xóa style tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Xóa các event handler (onclick, onload, ...)
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')
    // Xóa javascript: trong href/src
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    // Chuẩn hóa khoảng trắng
    .replace(/\s{3,}/g, ' ')
    .trim();
}

/**
 * Trích xuất nội dung bài viết từ một URL
 * @param url - URL của bài viết cần trích xuất
 * @returns ReaderContent với tiêu đề và nội dung đã làm sạch
 */
export async function extractArticleContent(url: string): Promise<ReaderContent> {
  // Fetch trang web gốc (timeout 12 giây)
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`Không thể tải trang: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // Parse HTML
  const root = parseHtml(html, {
    lowerCaseTagName: true,
    comment: false,           // Bỏ qua comments HTML
    blockTextElements: {
      script: false,          // Không parse nội dung script
      style: false,           // Không parse nội dung style
    },
  });

  // ---- Trích xuất Metadata ----

  // Tiêu đề: thử og:title trước, rồi h1, rồi title tag
  const ogTitle = root.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const h1Title = root.querySelector('h1')?.innerText;
  const pageTitle = root.querySelector('title')?.innerText;
  const title = (ogTitle || h1Title || pageTitle || 'Không có tiêu đề').trim();

  // Tên website
  const ogSiteName = root.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
  const siteName = ogSiteName || new URL(url).hostname.replace('www.', '');

  // Tác giả
  const authorEl =
    root.querySelector('meta[name="author"]')?.getAttribute('content') ||
    root.querySelector('[rel="author"]')?.innerText ||
    root.querySelector('[class*="author"]')?.innerText ||
    root.querySelector('[itemprop="author"]')?.innerText ||
    '';
  const author = authorEl.trim().slice(0, 100); // Giới hạn độ dài

  // Ngày đăng
  const publishedDate =
    root.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
    root.querySelector('time')?.getAttribute('datetime') ||
    root.querySelector('[itemprop="datePublished"]')?.getAttribute('content') ||
    '';

  // ---- Xóa các phần không cần thiết ----
  for (const selector of REMOVE_SELECTORS) {
    try {
      root.querySelectorAll(selector).forEach((el) => el.remove());
    } catch {
      // Bỏ qua nếu selector không hợp lệ với một số trang
    }
  }

  // ---- Tìm nội dung chính ----
  let contentEl = null;
  for (const selector of CONTENT_SELECTORS) {
    const found = root.querySelector(selector);
    if (found) {
      contentEl = found;
      break;
    }
  }

  // Fallback: dùng body nếu không tìm thấy container rõ ràng
  const rawContent = contentEl?.innerHTML || root.querySelector('body')?.innerHTML || '';

  // Làm sạch HTML
  const content = sanitizeHtml(rawContent);

  return {
    title,
    content: content || '<p>Không thể trích xuất nội dung. Vui lòng đọc trên trang gốc.</p>',
    author,
    publishedDate,
    siteName,
    originalUrl: url,
  };
}
