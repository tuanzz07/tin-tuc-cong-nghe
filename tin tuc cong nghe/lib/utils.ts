/**
 * lib/utils.ts
 * Các hàm tiện ích dùng chung trong toàn bộ ứng dụng.
 */

/**
 * Mã hóa URL thành ID an toàn cho URL (base64url)
 * Ví dụ: "https://vnexpress.net/abc" -> "aHR0cHM6..."
 */
export function encodeArticleId(url: string): string {
  // Buffer.from tạo buffer từ chuỗi, toString('base64url') mã hóa sang base64url
  // base64url không có ký tự +, /, = nên an toàn khi dùng trong URL
  return Buffer.from(url).toString('base64url');
}

/**
 * Giải mã ID thành URL gốc
 * Ví dụ: "aHR0cHM6..." -> "https://vnexpress.net/abc"
 */
export function decodeArticleId(id: string): string {
  try {
    return Buffer.from(id, 'base64url').toString('utf-8');
  } catch {
    // Nếu giải mã thất bại, trả về chuỗi rỗng
    return '';
  }
}

/**
 * Định dạng ngày giờ sang tiếng Việt
 * Ví dụ: "2026-01-15T10:30:00Z" -> "15 tháng 1, 2026, 17:30"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'Chưa rõ ngày';

  const date = new Date(dateString);

  // Kiểm tra ngày có hợp lệ không
  if (isNaN(date.getTime())) return 'Chưa rõ ngày';

  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Tính thời gian đọc ước tính (phút)
 * Dựa trên tốc độ đọc trung bình 200 từ/phút
 */
export function estimateReadTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Rút gọn văn bản nếu quá dài và thêm dấu "..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  // Tìm khoảng trắng cuối cùng trong phạm vi maxLength để không cắt ngang từ
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

/**
 * Loại bỏ tất cả thẻ HTML khỏi chuỗi
 * Ví dụ: "<p>Hello <b>world</b></p>" -> "Hello world"
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')        // Thay thẻ HTML bằng khoảng trắng
    .replace(/&amp;/g, '&')           // Giải mã HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')             // Gộp nhiều khoảng trắng thành một
    .trim();
}

/**
 * Tự động phân loại bài viết dựa trên tiêu đề và mô tả
 * Trả về slug danh mục phù hợp nhất
 */
export function categorizeArticle(
  title: string,
  description: string,
  defaultCategory: string
): string {
  // Nếu nguồn đã có danh mục cụ thể (không phải 'all'), giữ nguyên
  if (defaultCategory !== 'all') return defaultCategory;

  // Ghép tiêu đề và mô tả, chuyển về chữ thường để so sánh
  const text = `${title} ${description}`.toLowerCase();

  // Bảng từ khóa theo danh mục, kiểm tra theo thứ tự ưu tiên
  const categoryMatchers: Array<{ slug: string; keywords: string[] }> = [
    {
      slug: 'ai',
      keywords: ['artificial intelligence', 'machine learning', 'chatgpt', 'gpt-', 'llm',
        'deep learning', 'openai', 'gemini', 'claude', 'stable diffusion',
        'neural network', 'trí tuệ nhân tạo', 'học máy'],
    },
    {
      slug: 'security',
      keywords: ['hack', 'vulnerability', 'cybersecurity', 'breach', 'ransomware',
        'phishing', 'malware', 'exploit', 'zero-day', 'ddos', 'bảo mật', 'an ninh mạng'],
    },
    {
      slug: 'mobile',
      keywords: ['iphone', 'android', 'smartphone', 'samsung galaxy', 'pixel phone',
        'ios 1', 'ios update', 'điện thoại', 'apple watch'],
    },
    {
      slug: 'programming',
      keywords: ['javascript', 'typescript', 'python', 'rust lang', 'golang', 'java ',
        'framework', 'github', 'open source', 'npm ', 'devops', 'kubernetes',
        'lập trình', 'mã nguồn'],
    },
    {
      slug: 'hardware',
      keywords: ['nvidia', 'amd ', 'intel ', 'gpu', 'cpu', 'processor', 'chip ',
        'laptop', 'macbook', 'ssd', 'semiconductor', 'phần cứng', 'vi xử lý'],
    },
    {
      slug: 'science',
      keywords: ['nasa', 'spacex', 'space ', 'research', 'discovery', 'quantum',
        'climate', 'biology', 'telescope', 'khoa học', 'nghiên cứu', 'vũ trụ'],
    },
  ];

  for (const { slug, keywords } of categoryMatchers) {
    if (keywords.some((kw) => text.includes(kw))) {
      return slug;
    }
  }

  // Mặc định trả về 'all' nếu không khớp danh mục nào
  return 'all';
}

/**
 * Tạo màu placeholder ngẫu nhiên nhưng nhất quán từ một chuỗi
 * Dùng cho bài viết không có ảnh thumbnail
 */
export function getPlaceholderColor(seed: string): string {
  const colors = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-green-500 to-green-700',
    'from-orange-500 to-orange-700',
    'from-red-500 to-red-700',
    'from-teal-500 to-teal-700',
    'from-indigo-500 to-indigo-700',
    'from-pink-500 to-pink-700',
  ];
  // Tính hash đơn giản từ seed string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % colors.length;
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Chuyển đổi URL tương đối thành URL tuyệt đối
 * Cần thiết khi ảnh RSS dùng đường dẫn tương đối
 */
export function toAbsoluteUrl(url: string, baseUrl: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}
