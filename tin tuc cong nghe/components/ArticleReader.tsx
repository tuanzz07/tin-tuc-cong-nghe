/**
 * components/ArticleReader.tsx
 * Client Component hiển thị bài viết ở chế độ đọc (Reader Mode).
 *
 * 'use client' vì:
 * - Cần useEffect để fetch dữ liệu khi component mount
 * - Cần useState để quản lý trạng thái loading/error
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ReaderContent } from '@/lib/types';
import { decodeArticleId, formatDate, estimateReadTime } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface ArticleReaderProps {
  articleId: string; // Base64url encoded URL
}

export default function ArticleReader({ articleId }: ArticleReaderProps) {
  // State quản lý dữ liệu và trạng thái
  const [content, setContent] = useState<ReaderContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Giải mã ID thành URL gốc
  const originalUrl = decodeArticleId(articleId);

  // Fetch nội dung khi component mount
  useEffect(() => {
    if (!originalUrl) {
      setError('Đường dẫn bài viết không hợp lệ.');
      setLoading(false);
      return;
    }

    // Gọi API reader để lấy nội dung đã làm sạch
    fetch(`/api/reader?url=${encodeURIComponent(originalUrl)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Lỗi ${res.status}`);
        return res.json() as Promise<ReaderContent>;
      })
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Lỗi không xác định';
        setError(`Không thể tải nội dung bài viết: ${message}`);
        setLoading(false);
      });
  }, [originalUrl]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar trên cùng */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Nút quay lại */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </Link>

          {/* Label Reader Mode */}
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
            <span>📖</span>
            <span>Chế độ đọc</span>
          </div>

          {/* Nút mở bài gốc */}
          {originalUrl && (
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <span>Bài gốc</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Trạng thái loading */}
        {loading && (
          <LoadingSpinner message="Đang tải nội dung bài viết..." />
        )}

        {/* Trạng thái lỗi */}
        {error && !loading && (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block" aria-hidden="true">😕</span>
            <p className="text-gray-600 font-medium mb-2">{error}</p>
            <p className="text-gray-400 text-sm mb-6">
              Trang web gốc có thể không cho phép đọc nội dung từ bên ngoài.
            </p>
            {originalUrl && (
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white
                           rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Đọc trên trang gốc
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Nội dung bài viết */}
        {content && !loading && (
          <article className="animate-fade-in">
            {/* Header bài viết */}
            <header className="mb-8">
              {/* Tên website nguồn */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {content.siteName}
                </span>
              </div>

              {/* Tiêu đề */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                {content.title}
              </h1>

              {/* Metadata: tác giả, ngày, thời gian đọc */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 pb-4 border-b border-gray-200">
                {content.author && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {content.author}
                  </span>
                )}
                {content.publishedDate && (
                  <time dateTime={content.publishedDate}>
                    {formatDate(content.publishedDate)}
                  </time>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {estimateReadTime(content.content)} phút đọc
                </span>
              </div>
            </header>

            {/* Nội dung bài viết - dangerouslySetInnerHTML vì đây là HTML đã làm sạch */}
            {/* eslint-disable-next-line react/no-danger */}
            <div
              className="reader-content"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />

            {/* Footer bài viết */}
            <footer className="mt-10 pt-6 border-t border-gray-200">
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Đọc bài viết đầy đủ trên {content.siteName}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </footer>
          </article>
        )}
      </div>
    </div>
  );
}
