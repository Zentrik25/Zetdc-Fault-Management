import { FormSkeleton, HeaderSkeleton, LoadingShell } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="max-w-3xl mx-auto space-y-5">
      <HeaderSkeleton />
      <FormSkeleton fields={3} />
      <FormSkeleton fields={3} />
    </LoadingShell>
  );
}
