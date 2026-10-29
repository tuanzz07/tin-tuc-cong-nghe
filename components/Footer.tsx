/**
 * components/Footer.tsx
 * Chân trang của website.
 * Server Component - không cần interactivity.
 */

import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột 1: Thông tin website */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⚡</span>
              <span className="text-white font-bold text-lg">
                TechNews<span className="text-blue-400">VN</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tổng hợp tin tức công nghệ từ các nguồn uy tín trong nước và quốc tế.
              Cập nhật liên tục, đọc nhanh, hiểu sâu.
            </p>
          </div>

          {/* Cột 2: Danh mục */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Danh mục
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.filter((c) => c.slug !== 'all').map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Nguồn tin */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Nguồn tin
            </h3>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>VnExpress Công nghệ</li>
              <li>Tuổi Trẻ Khoa học</li>
              <li>Genk</li>
              <li>TechCrunch</li>
              <li>The Verge</li>
              <li>Ars Technica</li>
              <li>và nhiều nguồn khác...</li>
            </ul>
          </div>
        </div>

        {/* Đường phân cách */}
        <div className="border-t border-white/10 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© {currentYear} TechNews VN. Nội dung thuộc về các tác giả và nguồn gốc tương ứng.</p>
            <p>Được xây dựng với Next.js + Tailwind CSS</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
