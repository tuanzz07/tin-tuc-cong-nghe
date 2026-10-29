/**
 * components/Header.tsx
 * Thanh điều hướng chính của website.
 *
 * Đây là Server Component (không có 'use client') vì:
 * - Không cần state hay event handlers
 * - Render phía server tốt hơn cho SEO
 * Thanh search sẽ là Client Component riêng biệt.
 */

import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg sticky top-0 z-50">
      {/* Top bar: Logo + Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group"
            title="Trang chủ TechNews VN"
          >
            <span className="text-2xl" aria-hidden="true">⚡</span>
            <div>
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-300 transition-colors">
                TechNews
              </span>
              <span className="font-bold text-lg tracking-tight text-blue-400 group-hover:text-blue-200 transition-colors">
                VN
              </span>
            </div>
          </Link>

          {/* Search bar - Client Component */}
          <div className="flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Link đến trang tìm kiếm trên mobile */}
          <Link
            href="/search"
            className="sm:hidden text-gray-300 hover:text-white transition-colors p-2"
            aria-label="Tìm kiếm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Navigation bar: Các danh mục */}
      <nav
        className="border-t border-white/10 overflow-x-auto"
        aria-label="Điều hướng danh mục"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-2 min-w-max">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={category.slug === 'all' ? '/' : `/category/${category.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                           text-gray-300 hover:text-white hover:bg-white/10
                           transition-all duration-200 whitespace-nowrap"
              >
                <span aria-hidden="true">{category.icon}</span>
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
