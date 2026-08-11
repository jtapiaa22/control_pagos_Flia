import { Skeleton } from "@/components/ui/Skeleton";
import { PagoFormSkeleton } from "@/components/pagos/PagoFormSkeleton";

export default function NuevoPagoLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-32" />
      <div className="mt-6">
        <PagoFormSkeleton />
      </div>
    </div>
  );
}
