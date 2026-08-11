import { Skeleton } from "@/components/ui/Skeleton";

export default function UsuariosLoading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="mt-2 h-3.5 w-56" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      <div className="mt-6 divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
