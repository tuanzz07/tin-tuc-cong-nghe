/**
 * components/LoadingSpinner.tsx
 * Component hiển thị loading skeleton khi đang tải dữ liệu.
 * Dùng animation pulse để tạo hiệu ứng loading.
 */

// Skeleton cho một ArticleCard
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      {/* Ảnh skeleton */}
      <div className="h-48 bg-gray-200" />
      {/* Nội dung skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mt-4" />
      </div>
    </div>
  );
}

// Grid của nhiều skeleton cards
export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Spinner loading đơn giản
export function LoadingSpinner({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      {/* Spinner circle */}
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// Thông báo lỗi
export function ErrorMessage({
  message = 'Có lỗi xảy ra. Vui lòng thử lại sau.',
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-3" aria-hidden="true">😕</span>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
}

// Thông báo khi không có kết quả
export function EmptyState({ message = 'Không tìm thấy bài viết nào.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4" aria-hidden="true">📭</span>
      <p className="text-gray-500 text-lg font-medium">{message}</p>
      <p className="text-gray-400 text-sm mt-2">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
    </div>
  );
}
