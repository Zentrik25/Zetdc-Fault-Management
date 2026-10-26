import { HeaderSkeleton, ListSkeleton, LoadingShell } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="max-w-4xl mx-auto space-y-6">
      <HeaderSkeleton />
      <ListSkeleton rows={4} />
    </LoadingShell>
  );
}
