interface HotelsResultsSkeletonProps {
  count?: number;
}

export function HotelsResultsSkeleton({ count = 6 }: HotelsResultsSkeletonProps) {
  return (
    <div className="grid gap-x-3 gap-y-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-4 sm:gap-y-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={`hotel-skeleton-${index}`} className="bg-white" aria-hidden="true">
          <div className="flex gap-2.5 sm:hidden">
            <div className="h-24 w-[38%] shrink-0 animate-pulse rounded-[1rem] bg-slate-200" />
            <div className="flex-1 space-y-2.5 pt-1">
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
              <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-200" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-3 w-16 animate-pulse rounded-full bg-slate-200" />
                <div className="flex gap-1.5">
                  {Array.from({ length: 4 }).map((_, dotIndex) => (
                    <div key={`mobile-skeleton-dot-${index}-${dotIndex}`} className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-200" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="aspect-[4/3] animate-pulse rounded-[1.55rem] bg-slate-200" />
            <div className="space-y-2.5 px-1 pb-1 pt-3">
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-slate-200" />
              <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-200" />
              <div className="h-3 w-1/3 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
