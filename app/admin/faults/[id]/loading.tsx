import { DetailSkeleton, LoadingShell, Skel } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="space-y-4">
      <Skel className="h-4 w-24" />
      <DetailSkeleton />
    </LoadingShell>
  );
}
