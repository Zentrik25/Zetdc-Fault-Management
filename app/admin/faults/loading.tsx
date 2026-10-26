import { HeaderSkeleton, ListSkeleton, LoadingShell, Skel } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="space-y-4">
      <HeaderSkeleton />
      <div className="card flex flex-wrap gap-2">
        <Skel className="h-10 w-64 max-w-full" />
        {Array.from({ length: 5 }).map((_, i) => <Skel key={i} className="h-10 w-28" />)}
      </div>
      <ListSkeleton rows={6} />
    </LoadingShell>
  );
}
