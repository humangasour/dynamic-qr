import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="py-6 px-page">
      <div className="py-6 max-w-5xl mx-auto">
        {/* Page heading skeleton */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-72 mt-2" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        {/* Details content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-40 w-full lg:col-span-2" />
        </div>
      </div>
    </main>
  );
}
