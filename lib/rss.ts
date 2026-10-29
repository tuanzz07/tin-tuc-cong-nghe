/**
 * lib/rss.ts
 * Module lõi xử lý việc lấy và phân tích dữ liệu RSS feeds.
 *
 * RSS (Really Simple Syndication) là định dạng XML chuẩn để phân phối nội dung.
 * Hầu hết các trang báo lớn đều cung cấp RSS feed.
 */

import { XMLParser } from 'fast-xml-parser';
import type { Article, RSSSource } from './types';
import { categorizeArticle, encodeArticleId, stripHtml, toAbsoluteUrl } from './utils';

// ===========================
// CẤU HÌNH XML PARSER
// ===========================

// Khởi tạo parser với các tùy chọn xử lý đúng các cấu trúc RSS phức tạp
const xmlParser = new XMLParser({
  ignoreAttributes: false,          // Giữ lại attributes của XML (vd: url="...", type="...")
  attributeNamePrefix: '@_',        // Prefix cho attributes để phân biệt với elements
  // Bắt buộc treat các tags này là array dù chỉ có 1 phần tử
  isArray: (tagName) => ['item', 'entry', 'link', 'category'].includes(tagName),
  parseTagValue: true,              // Tự động parse số và boolean
  trimValues: true,                 // Loại bỏ khoảng trắng thừa
});

// ===========================
// DANH SÁCH CÁC NGUỒN RSS
// ===========================

export const RSS_SOURCES: RSSSource[] = [
  // ----- Nguồn tiếng Việt -----
  {
    name: 'VnExpress Công nghệ',
    url: 'https://vnexpress.net/rss/khoa-hoc-cong-nghe.rss',
    category: 'all',
    language: 'vi',
  },
  {
    name: 'Tuổi Trẻ Khoa học',
    url: 'https://tuoitre.vn/rss/khoa-hoc.rss',
    category: 'all',
    language: 'vi',
  },
  {
    name: 'Genk',
    url: 'https://genk.vn/rss.gk',
    category: 'all',
    language: 'vi',
  },

  // ----- AI & Machine Learning -----
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'ai',
    language: 'en',
  },
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
    category: 'ai',
    language: 'en',
  },

  // ----- Lập trình -----
  {
    name: 'Dev.to',
    url: 'https://dev.to/feed',
    category: 'programming',
    language: 'en',
  },

  // ----- Phần cứng -----
  {
    name: "Tom's Hardware",
    url: 'https://www.tomshardware.com/feeds/all',
    category: 'hardware',
    language: 'en',
  },

  // ----- Bảo mật -----
  {
    name: 'The Hacker News',
    url: 'https://feeds.feedburner.com/TheHackersNews',
    category: 'security',
    language: 'en',
  },
  {
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com/feed/',
    category: 'security',
    language: 'en',
  },

  // ----- Di động -----
  {
    name: 'Android Authority',
    url: 'https://www.androidauthority.com/feed/',
    category: 'mobile',
    language: 'en',
  },
  {
    name: '9to5Mac',
    url: 'https://9to5mac.com/feed/',
    category: 'mobile',
    language: 'en',
  },

  // ----- Tổng hợp -----
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'all',
    language: 'en',
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'all',
    language: 'en',
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    category: 'all',
    language: 'en',
  },
];

// ===========================
// HÀM TRÍCH XUẤT DỮ LIỆU
// ===========================

/**
 * Trích xuất giá trị text từ một node XML (có thể là string hoặc object phức tạp)
 * Cần thiết vì fast-xml-parser có thể trả về nhiều kiểu dữ liệu khác nhau
 */
function getText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // Atom feed thường lưu text trong '#text'
    if (obj['#text']) return getText(obj['#text']);
    if (obj['_']) return getText(obj['_']);
  }
  return '';
}

/**
 * Trích xuất URL từ phần tử link (khác nhau giữa RSS 2.0 và Atom)
 *
 * RSS 2.0: <link>https://...</link>  (string đơn giản)
 * Atom:    <link href="https://..." rel="alternate"/>  (object hoặc array)
 */
function getLink(item: Record<string, unknown>): string {
  const link = item['link'];

  // RSS 2.0: link là string
  if (typeof link === 'string') return link;

  // Atom: link là array của objects
  if (Array.isArray(link)) {
    for (const l of link) {
      if (l && typeof l === 'object') {
        const linkObj = l as Record<string, unknown>;
        const rel = linkObj['@_rel'];
        const href = linkObj['@_href'];
        // Ưu tiên link có rel="alternate" hoặc không có rel
        if ((!rel || rel === 'alternate') && typeof href === 'string') {
          return href;
        }
      }
    }
    // Fallback: lấy link đầu tiên có href
    for (const l of link) {
      if (l && typeof l === 'object') {
        const href = (l as Record<string, unknown>)['@_href'];
        if (typeof href === 'string') return href;
      }
    }
  }

  // Atom: link là object đơn
  if (link && typeof link === 'object') {
    const href = (link as Record<string, unknown>)['@_href'];
    if (typeof href === 'string') return href;
  }

  return '';
}

/**
 * Trích xuất URL ảnh thumbnail từ item RSS
 * Kiểm tra nhiều vị trí khác nhau vì mỗi nguồn dùng cách khác nhau
 */
function extractImageUrl(item: Record<string, unknown>, sourceUrl: string): string | undefined {
  // 1. Kiểm tra thẻ <enclosure> (RSS 2.0 chuẩn)
  const enclosure = item['enclosure'] as Record<string, unknown> | undefined;
  if (enclosure) {
    const encType = enclosure['@_type'];
    const encUrl = enclosure['@_url'];
    if (typeof encType === 'string' && encType.startsWith('image/') && typeof encUrl === 'string') {
      return toAbsoluteUrl(encUrl, sourceUrl);
    }
  }

  // 2. Kiểm tra thẻ <media:content> (Media RSS namespace)
  const mediaContent = item['media:content'] as Record<string, unknown> | undefined;
  if (mediaContent?.['@_url']) {
    return toAbsoluteUrl(String(mediaContent['@_url']), sourceUrl);
  }

  // 3. Kiểm tra thẻ <media:thumbnail>
  const mediaThumbnail = item['media:thumbnail'] as Record<string, unknown> | undefined;
  if (mediaThumbnail?.['@_url']) {
    return toAbsoluteUrl(String(mediaThumbnail['@_url']), sourceUrl);
  }

  // 4. Tìm thẻ <img> trong description hoặc content
  const description = getText(item['description'] ?? item['summary'] ?? item['content'] ?? '');
  const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) {
    return toAbsoluteUrl(imgMatch[1], sourceUrl);
  }

  // 5. Kiểm tra image trong content:encoded (WordPress)
  const contentEncoded = item['content:encoded'];
  if (typeof contentEncoded === 'string') {
    const match = contentEncoded.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1]) return toAbsoluteUrl(match[1], sourceUrl);
  }

  return undefined;
}

/**
 * Chuyển đổi một item RSS/Atom thành Article object chuẩn hóa
 */
function parseItem(
  item: Record<string, unknown>,
  source: RSSSource
): Article | null {
  // Lấy tiêu đề (bắt buộc)
  const title = stripHtml(getText(item['title'])).trim();
  if (!title) return null;

  // Lấy link (bắt buộc)
  const link = getLink(item).trim();
  if (!link) return null;

  // Lấy mô tả
  const rawDesc =
    getText(item['description']) ||
    getText(item['summary']) ||
    getText(item['content']) ||
    '';
  const description = stripHtml(rawDesc).slice(0, 500).trim();

  // Lấy ngày đăng (RSS 2.0 dùng pubDate, Atom dùng published/updated)
  const pubDateRaw =
    getText(item['pubDate']) ||
    getText(item['published']) ||
    getText(item['updated']) ||
    getText(item['dc:date']) ||
    '';
  const pubDate = pubDateRaw ? new Date(pubDateRaw).toISOString() : new Date().toISOString();

  // Lấy tác giả
  const authorField = item['author'] ?? item['dc:creator'];
  let author = '';
  if (typeof authorField === 'string') {
    author = authorField;
  } else if (authorField && typeof authorField === 'object') {
    const authorObj = authorField as Record<string, unknown>;
    author = getText(authorObj['name'] ?? authorObj['#text'] ?? '');
  }

  // Lấy ảnh
  const imageUrl = extractImageUrl(item, source.url);

  // Xác định danh mục
  const category = categorizeArticle(title, description, source.category);

  // Tạo ID duy nhất từ URL
  const id = encodeArticleId(link);

  return {
    id,
    title,
    description,
    link,
    pubDate,
    source: source.name,
    category,
    imageUrl,
    author: author || undefined,
    language: source.language,
  };
}

// ===========================
// HÀM LẤY DỮ LIỆU
// ===========================

/**
 * Lấy và phân tích một RSS feed đơn lẻ
 * @param source - Nguồn RSS cần lấy dữ liệu
 * @returns Mảng các bài viết, hoặc mảng rỗng nếu có lỗi
 */
async function fetchSingleFeed(source: RSSSource): Promise<Article[]> {
  try {
    // Fetch với timeout 8 giây để tránh chờ quá lâu
    const response = await fetch(source.url, {
      headers: {
        // Giả lập browser để tránh bị chặn
        'User-Agent': 'Mozilla/5.0 (compatible; TechNewsVN/1.0; RSS Reader)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
      // Cache 30 phút - Next.js sẽ tự động cache lại
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000), // 8 giây timeout
    });

    if (!response.ok) {
      console.warn(`[RSS] Lỗi ${response.status} khi lấy ${source.name}: ${source.url}`);
      return [];
    }

    const xmlText = await response.text();

    // Parse XML
    const parsed = xmlParser.parse(xmlText) as Record<string, unknown>;

    // Tìm items (RSS 2.0 dùng rss.channel.item, Atom dùng feed.entry)
    let items: unknown[] = [];

    if (parsed['rss']) {
      // RSS 2.0 format
      const rss = parsed['rss'] as Record<string, unknown>;
      const channel = rss['channel'] as Record<string, unknown> | undefined;
      if (channel) {
        const channelItems = channel['item'];
        items = Array.isArray(channelItems) ? channelItems : channelItems ? [channelItems] : [];
      }
    } else if (parsed['feed']) {
      // Atom format
      const feed = parsed['feed'] as Record<string, unknown>;
      const entries = feed['entry'];
      items = Array.isArray(entries) ? entries : entries ? [entries] : [];
    } else if (parsed['rdf:RDF']) {
      // RDF/RSS 1.0 format
      const rdf = parsed['rdf:RDF'] as Record<string, unknown>;
      const rdfItems = rdf['item'];
      items = Array.isArray(rdfItems) ? rdfItems : rdfItems ? [rdfItems] : [];
    }

    // Chuyển đổi các items thành Article objects, lọc bỏ null
    const articles: Article[] = [];
    for (const item of items.slice(0, 20)) { // Giới hạn 20 bài mỗi nguồn
      const article = parseItem(item as Record<string, unknown>, source);
      if (article) articles.push(article);
    }

    return articles;
  } catch (error) {
    // Log lỗi nhưng không throw để không làm hỏng toàn bộ request
    console.warn(`[RSS] Không thể lấy feed từ ${source.name}:`, error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Lấy tất cả bài viết từ nhiều nguồn RSS cùng lúc
 * @param category - Danh mục cần lọc ('all' = tất cả)
 * @param searchQuery - Từ khóa tìm kiếm (rỗng = không lọc)
 * @param limit - Số bài viết tối đa trả về
 */
export async function fetchAllFeeds(
  category: string = 'all',
  searchQuery: string = '',
  limit: number = 60
): Promise<Article[]> {
  // Lọc nguồn theo danh mục để giảm số request
  const sourcesToFetch =
    category === 'all'
      ? RSS_SOURCES
      : RSS_SOURCES.filter((s) => s.category === category || s.category === 'all');

  // Fetch tất cả nguồn song song (Promise.allSettled không throw khi một nguồn lỗi)
  const results = await Promise.allSettled(
    sourcesToFetch.map((source) => fetchSingleFeed(source))
  );

  // Gộp tất cả bài viết từ các nguồn thành công
  let articles: Article[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles = articles.concat(result.value);
    }
    // Bỏ qua nguồn bị lỗi (rejected)
  }

  // Lọc theo danh mục (áp dụng cho bài từ nguồn 'all')
  if (category !== 'all') {
    articles = articles.filter((a) => a.category === category);
  }

  // Lọc theo từ khóa tìm kiếm (không phân biệt hoa/thường)
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
    );
  }

  // Sắp xếp theo ngày mới nhất
  articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // Loại bỏ bài trùng lặp (cùng ID/URL)
  const seen = new Set<string>();
  const deduplicated = articles.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  return deduplicated.slice(0, limit);
}
