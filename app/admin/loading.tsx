import { CardSkeleton, HeaderSkeleton, ListSkeleton, LoadingShell, Skel, StatsSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="space-y-6">
      <HeaderSkeleton action />
      <StatsSkeleton n={8} />
      <div className="grid lg:grid-cols-2 gap-4">
        <CardSkeleton lines={6} />
        <CardSkeleton lines={6} />
      </div>
      <Skel className="h-6 w-40" />
      <ListSkeleton rows={2} />
    </LoadingShell>
  );
}
