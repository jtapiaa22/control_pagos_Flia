import { Skeleton } from "@/components/ui/Skeleton";
import { PagoListSkeleton } from "@/components/pagos/PagoListSkeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-24" />
      <Skeleton className="mt-2 h-4 w-56" />

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border-subtle bg-surface-card p-5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-7 w-24" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Skeleton className="h-4 w-40" />
        <div className="mt-2">
          <PagoListSkeleton filas={3} />
        </div>
      </div>
    </div>
  );
}
