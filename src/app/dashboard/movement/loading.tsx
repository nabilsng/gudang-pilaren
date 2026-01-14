import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-4 shadow-sm">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-9 w-20" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border p-4 shadow-sm">
          <Skeleton className="h-5 w-40" />
          <div className="mt-3 grid gap-2 sm:grid-cols-12">
            <Skeleton className="h-10 sm:col-span-5" />
            <Skeleton className="h-10 sm:col-span-2" />
            <Skeleton className="h-10 sm:col-span-2" />
            <Skeleton className="h-10 sm:col-span-2" />
            <Skeleton className="h-10 sm:col-span-1" />
          </div>

          <div className="mt-4 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
