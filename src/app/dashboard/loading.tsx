import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-4 shadow-sm">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-9 w-20" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border p-4 shadow-sm">
          <Skeleton className="h-4 w-24" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-72" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      </div>
    </main>
  );
}
