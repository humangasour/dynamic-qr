import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="py-6 px-page">
      <div className="py-6">
        <div className="max-w-2xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-8">
            <Skeleton className="h-9 w-64 mx-auto" />
            <Skeleton className="h-5 w-96 mx-auto mt-3" />
          </div>
          {/* Form skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-36" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
