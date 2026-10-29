/**
 * components/CategoryFilter.tsx
 * Bộ lọc danh mục - hiển thị các pills để lọc bài viết.
 * Server Component - dùng Link thay vì onClick để phù hợp SSR.
 */

import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { getCategoryColors } from '@/lib/categories';

interface CategoryFilterProps {
  currentCategory: string;  // Danh mục đang được chọn
  baseUrl?: string;          // Base URL để tạo link (mặc định "/")
}

export default function CategoryFilter({
  currentCategory,
  baseUrl = '/',
}: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max px-1">
        {CATEGORIES.map((category) => {
          const isActive = currentCategory === category.slug;
          const colors = getCategoryColors(category.color);

          // Tạo href cho từng category pill
          const href =
            category.slug === 'all'
              ? baseUrl
              : `${baseUrl}?category=${category.slug}`;

          return (
            <Link
              key={category.slug}
              href={href}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                border transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? `${colors.bg} text-white border-transparent shadow-sm`
                  : `bg-white ${colors.text} ${colors.border} hover:${colors.lightBg}`
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <span aria-hidden="true">{category.icon}</span>
              <span>{category.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
