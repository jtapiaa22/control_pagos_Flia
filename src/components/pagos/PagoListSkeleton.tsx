import { Skeleton } from "@/components/ui/Skeleton";

export function PagoListSkeleton({ filas = 5 }: { filas?: number }) {
  return (
    <div className="divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="flex h-16 items-center gap-3 px-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
