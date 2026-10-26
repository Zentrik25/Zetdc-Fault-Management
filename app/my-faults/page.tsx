import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { listFaults } from "@/lib/faults";
import FaultList from "@/components/FaultList";

export default async function Page() {
  const u = await requirePage("customer");
  const faults = await listFaults(u);
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My faults</h1>
        <Link href="/report" className="btn">+ Report a fault</Link>
      </div>
      <FaultList faults={faults} base="/my-faults" />
    </div>
  );
}
