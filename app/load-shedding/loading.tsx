import { HeaderSkeleton, ListSkeleton, LoadingShell, Skel } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="max-w-3xl mx-auto space-y-4">
      <HeaderSkeleton />
      <div className="card flex gap-2"><Skel className="h-10 flex-1" /><Skel className="h-10 w-20" /></div>
      <Skel className="h-5 w-40" />
      <ListSkeleton rows={4} />
    </LoadingShell>
  );
}
