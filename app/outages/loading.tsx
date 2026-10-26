import { HeaderSkeleton, ListSkeleton, LoadingShell, MapSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="space-y-5">
      <HeaderSkeleton />
      <MapSkeleton height={460} />
      <ListSkeleton rows={3} />
    </LoadingShell>
  );
}
