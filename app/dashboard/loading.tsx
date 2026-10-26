import { CardSkeleton, HeaderSkeleton, ListSkeleton, LoadingShell, Skel, StatsSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="space-y-6">
      <HeaderSkeleton action />
      <StatsSkeleton n={3} cols="grid-cols-3" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2"><Skel className="h-6 w-36" /><ListSkeleton rows={2} /></div>
          <div className="space-y-2"><Skel className="h-6 w-36" /><CardSkeleton lines={2} /></div>
        </div>
        <div className="space-y-3">
          <Skel className="h-6 w-32" />
          {Array.from({ length: 4 }).map((_, i) => <Skel key={i} className="h-12 w-full !rounded-md" />)}
        </div>
      </div>
    </LoadingShell>
  );
}
