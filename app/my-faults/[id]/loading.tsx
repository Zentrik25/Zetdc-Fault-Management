import { CardSkeleton, LoadingShell, Skel } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="max-w-3xl mx-auto space-y-4">
      <Skel className="h-4 w-24" />
      <div className="card space-y-4">
        <div className="flex justify-between gap-3">
          <div className="space-y-2"><Skel className="h-3 w-24" /><Skel className="h-7 w-52" /></div>
          <Skel className="h-6 w-24" />
        </div>
        <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <Skel key={i} className="h-2 flex-1" />)}</div>
        <Skel className="h-4 w-full" />
        <Skel className="h-4 w-4/5" />
      </div>
      <CardSkeleton lines={2} />
      <CardSkeleton lines={4} />
    </LoadingShell>
  );
}
