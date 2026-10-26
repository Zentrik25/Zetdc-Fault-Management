import { HeaderSkeleton, ListSkeleton, LoadingShell } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="max-w-3xl mx-auto space-y-4">
      <HeaderSkeleton action />
      <ListSkeleton rows={5} />
    </LoadingShell>
  );
}
