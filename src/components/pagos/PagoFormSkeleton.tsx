import { Skeleton } from "@/components/ui/Skeleton";
import { cardClass } from "@/lib/ui";

export function PagoFormSkeleton() {
  return (
    <div className={`space-y-4 ${cardClass}`}>
      <div>
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="mt-1 h-10 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="mt-1 h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="mt-1 h-10 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="mt-1 h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="mt-1 h-10 w-full" />
        </div>
      </div>
      <div>
        <Skeleton className="h-3.5 w-14" />
        <Skeleton className="mt-1 h-20 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
