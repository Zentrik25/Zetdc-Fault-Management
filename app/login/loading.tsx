import { LoadingShell, Skel } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="card max-w-md mx-auto space-y-4">
      <Skel className="h-8 w-40" />
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-2"><Skel className="h-3.5 w-20" /><Skel className="h-10 w-full" /></div>
      ))}
      <Skel className="h-10 w-full" />
    </LoadingShell>
  );
}
