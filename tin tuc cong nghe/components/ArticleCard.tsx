/**
 * components/ArticleCard.tsx
 * Card hiển thị một bài viết trong danh sách.
 *
 * Nhận một Article object và render card với:
 * - Ảnh thumbnail (hoặc placeholder màu)
 * - Badge danh mục và ngôn ngữ
 * - Tiêu đề và mô tả ngắn
 * - Thông tin nguồn, ngày đăng, thời gian đọc
 * - Nút Reader Mode
 */

import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/lib/types';
import { formatDate, estimateReadTime, getPlaceholderColor } from '@/lib/utils';
import { getCategoryBySlug, getCategoryColors } from '@/lib/categories';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const category = getCategoryBySlug(article.category);
  const colors = getCategoryColors(category?.color ?? 'slate');
  const readTime = estimateReadTime(article.description);
  const placeholderGradient = getPlaceholderColor(article.id);

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
                        hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Ảnh thumbnail */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            // Không hiển thị lỗi nếu ảnh không tải được
            onError={() => {/* Bỏ qua lỗi ảnh */}}
          />
        ) : (
          // Placeholder gradient khi không có ảnh
          <div className={`w-full h-full bg-gradient-to-br ${placeholderGradient} flex items-center justify-center`}>
            <span className="text-4xl opacity-60" aria-hidden="true">
              {category?.icon ?? '📰'}
            </span>
          </div>
        )}

        {/* Badge danh mục nổi trên ảnh */}
        <div className="absolute top-3 left-3">
          <span className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
            ${colors.bg} text-white shadow-sm
          `}>
            <span aria-hidden="true">{category?.icon}</span>
            <span>{category?.name ?? 'Công nghệ'}</span>
          </span>
        </div>

        {/* Badge ngôn ngữ */}
        <div className="absolute top-3 right-3">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${article.language === 'vi'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
            }
          `}>
            {article.language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
          </span>
        </div>
      </div>

      {/* Nội dung card */}
      <div className="p-4 flex flex-col flex-1">
        {/* Tiêu đề bài viết */}
        <h2 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
          {/* Link đến trang Reader Mode */}
          <Link
            href={`/article/${article.id}`}
            className="hover:text-blue-600 transition-colors"
            title={article.title}
          >
            {article.title}
          </Link>
        </h2>

        {/* Mô tả ngắn */}
        {article.description && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-3 flex-1">
            {article.description}
          </p>
        )}

        {/* Footer card: Nguồn + Ngày + Thời gian đọc */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            {/* Badge tên nguồn */}
            <span className={`
              text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0
              ${colors.lightBg} ${colors.text}
            `}>
              {article.source}
            </span>
            {/* Thời gian đọc */}
            <span className="text-xs text-gray-400 flex-shrink-0">
              {readTime} phút đọc
            </span>
          </div>

          {/* Ngày đăng */}
          <time
            dateTime={article.pubDate}
            className="text-xs text-gray-400 flex-shrink-0"
            title={formatDate(article.pubDate)}
          >
            {getRelativeTime(article.pubDate)}
          </time>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-2 mt-3">
          {/* Nút Reader Mode (nội bộ) */}
          <Link
            href={`/article/${article.id}`}
            className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-medium
                       bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            📖 Chế độ đọc
          </Link>

          {/* Nút mở bài gốc */}
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-medium
                       bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
            title="Mở bài viết gốc"
          >
            🔗 Bài gốc
          </a>
        </div>
      </div>
    </article>
  );
}

/**
 * Tính thời gian tương đối (vd: "2 giờ trước", "3 ngày trước")
 * Dùng cho hiển thị ngân gọn trên card
 */
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return `${Math.floor(diffDays / 30)} tháng trước`;
}
