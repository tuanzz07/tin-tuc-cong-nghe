/**
 * components/SearchBar.tsx
 * Thanh tìm kiếm - Client Component vì cần xử lý sự kiện người dùng.
 *
 * 'use client' cho phép dùng hooks như useState, useRouter
 */

'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  // State lưu giá trị trong ô input
  const [query, setQuery] = useState('');

  // useRouter cho phép navigate bằng code (không phải link)
  const router = useRouter();

  // Xử lý khi người dùng submit form tìm kiếm
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Ngăn form reload trang
    const trimmed = query.trim();
    if (trimmed) {
      // Chuyển hướng đến trang tìm kiếm với query param
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative hidden sm:block">
      <div className="relative">
        {/* Icon kính lúp */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input field */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm tin tức..."
          aria-label="Tìm kiếm tin tức công nghệ"
          className="
            w-full pl-10 pr-4 py-2 rounded-full text-sm
            bg-white/10 text-white placeholder-gray-400
            border border-white/20
            focus:outline-none focus:bg-white/20 focus:border-white/40
            transition-all duration-200
          "
        />

        {/* Nút tìm kiếm (ẩn, dùng Enter để submit) */}
        <button type="submit" className="sr-only">
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}
