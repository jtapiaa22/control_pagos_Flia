import { Skeleton } from "@/components/ui/Skeleton";

export default function DetallePagoLoading() {
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-3.5 w-24" />
        </div>
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>

      <div className="mt-6 space-y-4 rounded-lg border border-border-subtle bg-surface-card p-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Skeleton className="h-10 w-44 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </div>
  );
}
