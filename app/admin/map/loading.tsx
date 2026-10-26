import { HeaderSkeleton, LoadingShell, MapSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="space-y-3">
      <HeaderSkeleton />
      <MapSkeleton height={560} />
    </LoadingShell>
  );
}
