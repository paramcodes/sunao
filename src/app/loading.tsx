import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <div className="hidden w-56 shrink-0 bg-black p-4 lg:block">
          <Skeleton className="mb-4 h-8 w-32" />
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="mb-2 h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <Skeleton className="h-8 w-48" />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={`album-slot-${i + 1}`} className="rounded-3xl bg-[#181818] p-4">
                <Skeleton className="mb-3 aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-1 h-3 w-16" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-8 h-6 w-20" />
          <div className="mt-3 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={`row-slot-${i}`} className="h-12 w-full rounded" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
