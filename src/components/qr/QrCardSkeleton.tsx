import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function QrCardSkeleton() {
  return (
    <Card role="group" aria-hidden className="overflow-hidden gap-4 py-2">
      <CardHeader className="p-4 pb-2 gap-x-0">
        <div className="flex items-start gap-4 min-w-0 w-full">
          <div className="shrink-0">
            <Skeleton className="size-16 rounded-md" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="ml-auto">
            <Skeleton className="size-9 rounded-full" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-2 pt-3">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Skeleton className="h-3 w-10 rounded" />
            <Skeleton className="h-4 w-3/4 flex-1" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Skeleton className="h-3 w-10 rounded" />
            <Skeleton className="h-4 w-4/5 flex-1" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Skeleton className="h-5 w-10 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-24 ml-auto" />
        </div>
      </CardContent>

      <CardFooter className="px-4 pt-0 pb-4">
        <div className="grid w-full grid-cols-2 gap-2">
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}

export default QrCardSkeleton;
