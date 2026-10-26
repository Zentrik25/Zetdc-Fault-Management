import { FormSkeleton, LoadingShell, Skel, TableSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingShell className="space-y-4">
      <Skel className="h-8 w-32" />
      <FormSkeleton fields={4} />
      <TableSkeleton rows={6} />
    </LoadingShell>
  );
}
