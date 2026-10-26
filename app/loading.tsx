import { CardSkeleton, HeaderSkeleton, ListSkeleton, LoadingShell } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="space-y-6">
      <HeaderSkeleton />
      <CardSkeleton lines={3} />
      <ListSkeleton rows={3} />
    </LoadingShell>
  );
}
