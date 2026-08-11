import { Skeleton } from "@/components/ui/Skeleton";
import { PagoListSkeleton } from "@/components/pagos/PagoListSkeleton";

export default function PagosLoading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>
      <div className="mt-4">
        <PagoListSkeleton />
      </div>
    </div>
  );
}
