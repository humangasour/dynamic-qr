import QrCardSkeleton from '@/components/qr/QrCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="py-6 px-page">
      <div className="py-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-80 mt-2" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <QrCardSkeleton key={`more-${i}`} />
          ))}
        </div>
      </div>
    </main>
  );
}
