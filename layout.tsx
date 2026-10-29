/**
 * app/layout.tsx
 * Root Layout - Layout gốc bao bọc toàn bộ ứng dụng.
 *
 * File này được Next.js tự động áp dụng cho tất cả các trang.
 * Định nghĩa metadata (SEO), fonts, và cấu trúc HTML cơ bản.
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Tải font Inter từ Google Fonts với hỗ trợ tiếng Việt
// next/font tự động tối ưu và self-host font
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  // Tạo biến CSS để dùng trong Tailwind config
  variable: '--font-inter',
  display: 'swap', // Hiển thị text với font hệ thống trong khi chờ font tải
});

// Metadata cho SEO - Next.js tự động tạo các thẻ <head>
export const metadata: Metadata = {
  title: {
    default: 'TechNews VN - Tin tức Công nghệ',
    // %s sẽ được thay bằng tiêu đề trang con (vd: "AI | TechNews VN")
    template: '%s | TechNews VN',
  },
  description:
    'Tổng hợp tin tức công nghệ mới nhất từ các nguồn uy tín trong nước và quốc tế. ' +
    'AI, lập trình, phần cứng, bảo mật, di động và khoa học.',
  keywords: ['công nghệ', 'tin tức', 'AI', 'lập trình', 'phần cứng', 'bảo mật'],
  authors: [{ name: 'TechNews VN' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'TechNews VN',
  },
};

// RootLayout là Server Component (mặc định trong App Router)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // lang="vi" giúp screen reader và SEO biết ngôn ngữ trang
    <html lang="vi" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-gray-50">
        {/* Header cố định ở trên */}
        <Header />

        {/* Nội dung chính - flex-1 để đẩy footer xuống cuối */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
