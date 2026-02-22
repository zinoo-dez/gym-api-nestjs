import { cn } from "@/lib/utils";

interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="mt-4 h-8 w-36" />
      <SkeletonBlock className="mt-3 h-3 w-24" />
    </div>
  );
}

export function ChartSkeleton({ className }: SkeletonBlockProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <SkeletonBlock className="h-4 w-32" />
      <SkeletonBlock className="h-64 w-full" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonBlock key={`table-skeleton-${index}`} className="h-10 w-full" />
      ))}
    </div>
  );
}
