import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        <div className="space-y-6">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
        <div className="mt-6 lg:mt-0 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>

      <div className="sm:hidden sticky bottom-0 -mx-4 px-4 py-3 bg-bg-card border-t border-border">
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  )
}
