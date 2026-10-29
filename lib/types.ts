/**
 * lib/types.ts
 * Định nghĩa các kiểu dữ liệu (TypeScript interfaces) dùng trong toàn bộ ứng dụng.
 * Đây là "bản thiết kế" cho các đối tượng dữ liệu.
 */

// Đại diện cho một bài viết/tin tức
export interface Article {
  id: string;           // ID duy nhất, được mã hóa base64 từ URL gốc
  title: string;        // Tiêu đề bài viết
  description: string;  // Mô tả ngắn hoặc đoạn trích nội dung
  link: string;         // Đường dẫn gốc đến bài viết trên trang nguồn
  pubDate: string;      // Ngày đăng bài (định dạng ISO 8601)
  source: string;       // Tên nguồn báo (vd: "VnExpress", "TechCrunch")
  category: string;     // Danh mục (vd: "ai", "hardware", "programming")
  imageUrl?: string;    // URL ảnh thumbnail (có thể không có, dùng ?)
  author?: string;      // Tên tác giả (có thể không có)
  language: 'vi' | 'en'; // Ngôn ngữ bài viết
}

// Đại diện cho một nguồn RSS feed
export interface RSSSource {
  name: string;           // Tên hiển thị của nguồn
  url: string;            // URL của RSS feed
  category: string;       // Danh mục mặc định của nguồn này
  language: 'vi' | 'en'; // Ngôn ngữ của nguồn
}

// Đại diện cho một danh mục bài viết
export interface Category {
  slug: string;         // Đường dẫn URL thân thiện (vd: "ai", "hardware")
  name: string;         // Tên tiếng Việt hiển thị (vd: "Trí tuệ nhân tạo")
  description: string;  // Mô tả ngắn về danh mục
  icon: string;         // Emoji icon để hiển thị
  color: string;        // Màu Tailwind CSS (vd: "blue", "purple")
  keywords: string[];   // Từ khóa để tự động phân loại bài viết
}

// Kết quả trả về từ API Reader Mode
export interface ReaderContent {
  title: string;          // Tiêu đề bài viết đã trích xuất
  content: string;        // Nội dung HTML đã làm sạch
  author: string;         // Tên tác giả
  publishedDate: string;  // Ngày đăng
  siteName: string;       // Tên trang web nguồn
  originalUrl: string;    // URL gốc của bài viết
}

// Cấu trúc response từ API feeds
export interface FeedsResponse {
  articles: Article[];
  total: number;
  category: string;
}
