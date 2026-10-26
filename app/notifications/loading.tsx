import { LoadingShell, Skel } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="max-w-2xl mx-auto space-y-3">
      <Skel className="h-8 w-52" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="card space-y-2"><Skel className="h-4 w-4/5" /><Skel className="h-3 w-1/4" /></div>
      ))}
    </LoadingShell>
  );
}
