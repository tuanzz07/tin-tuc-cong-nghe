/**
 * app/api/feeds/route.ts
 * Route Handler để lấy danh sách bài viết từ RSS feeds.
 *
 * Endpoint: GET /api/feeds?category=ai&q=keyword&limit=20
 * - category: danh mục cần lọc (mặc định: "all")
 * - q: từ khóa tìm kiếm (mặc định: "")
 * - limit: số bài viết tối đa (mặc định: 30)
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchAllFeeds } from '@/lib/rss';

// Sử dụng Node.js runtime (không phải Edge) vì cần các API Node.js đầy đủ
export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Lấy các tham số từ URL query string
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('q') || '';
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 30;

  try {
    // Lấy bài viết từ RSS feeds
    const articles = await fetchAllFeeds(category, searchQuery, limit);

    // Trả về JSON response với headers cache phù hợp
    return NextResponse.json(
      {
        articles,
        total: articles.length,
        category,
      },
      {
        headers: {
          // Cache 30 phút ở CDN (Vercel Edge), 60 giây stale-while-revalidate
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('[API/feeds] Lỗi:', error);
    return NextResponse.json(
      { error: 'Không thể tải bài viết. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
