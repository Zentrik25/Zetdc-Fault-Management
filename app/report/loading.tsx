import { CardSkeleton, FormSkeleton, HeaderSkeleton, LoadingShell, MapSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="max-w-3xl mx-auto space-y-5">
      <HeaderSkeleton />
      <CardSkeleton lines={4} />
      <FormSkeleton fields={4} />
      <MapSkeleton height={320} />
    </LoadingShell>
  );
}
