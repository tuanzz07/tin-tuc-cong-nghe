/**
 * app/api/reader/route.ts
 * Route Handler để trích xuất nội dung bài viết (Reader Mode).
 *
 * Endpoint: GET /api/reader?url=https://...
 * Fetch trang web gốc và trả về nội dung đã làm sạch.
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractArticleContent } from '@/lib/reader';

// Sử dụng Node.js runtime (cần buffer, URL parsing, v.v.)
export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  // Kiểm tra URL có được cung cấp không
  if (!url) {
    return NextResponse.json(
      { error: 'Thiếu tham số url' },
      { status: 400 }
    );
  }

  // Kiểm tra URL có hợp lệ không
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json(
      { error: 'URL không hợp lệ' },
      { status: 400 }
    );
  }

  // Chỉ cho phép HTTP/HTTPS (không cho phép file://, javascript://, ...)
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: 'Chỉ hỗ trợ URL HTTP/HTTPS' },
      { status: 400 }
    );
  }

  try {
    const content = await extractArticleContent(url);
    return NextResponse.json(content, {
      headers: {
        // Cache reader content 1 giờ
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định';
    console.error('[API/reader] Lỗi khi lấy:', url, message);
    return NextResponse.json(
      { error: `Không thể tải nội dung: ${message}` },
      { status: 500 }
    );
  }
}
