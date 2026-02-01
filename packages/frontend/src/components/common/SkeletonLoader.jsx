/**
 * SkeletonLoader Components
 * Provides skeleton loading states for various content types
 */

import { memo } from "react";

export const SkeletonLoader = memo(function SkeletonLoader({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
});

export const TableSkeleton = memo(function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLoader key={`header-${i}`} className="h-6" />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-4 mb-3"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader key={`cell-${rowIndex}-${colIndex}`} className="h-5" />
          ))}
        </div>
      ))}
    </div>
  );
});

export const CardSkeleton = memo(function CardSkeleton({ count = 1 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6 space-y-3">
          <SkeletonLoader className="h-6 w-3/4" />
          <SkeletonLoader className="h-4 w-full" />
          <SkeletonLoader className="h-4 w-5/6" />
          <div className="flex gap-2 mt-4">
            <SkeletonLoader className="h-8 w-20" />
            <SkeletonLoader className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
});

export const FormSkeleton = memo(function FormSkeleton({ fields = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <SkeletonLoader className="h-4 w-24" />
          <SkeletonLoader className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 mt-6">
        <SkeletonLoader className="h-10 w-24" />
        <SkeletonLoader className="h-10 w-24" />
      </div>
    </div>
  );
});

export const ListSkeleton = memo(function ListSkeleton({ items = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <SkeletonLoader className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-4 w-1/3" />
            <SkeletonLoader className="h-3 w-1/2" />
          </div>
          <SkeletonLoader className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
});
