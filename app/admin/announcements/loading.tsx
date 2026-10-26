import { CardSkeleton, FormSkeleton, HeaderSkeleton, LoadingShell } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="max-w-3xl space-y-4">
      <HeaderSkeleton />
      <FormSkeleton fields={4} />
      <CardSkeleton lines={2} />
      <CardSkeleton lines={2} />
    </LoadingShell>
  );
}
