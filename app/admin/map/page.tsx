import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { listFaults } from "@/lib/faults";
import { toPin } from "@/lib/pins";
import FaultsMap from "@/components/FaultsMap";

export default async function Page() {
  const u = await requirePage("admin", "technician");
  const faults = await listFaults(u, { status: "open" }, 500);
  const pins = faults.map((f) => toPin(f, `/admin/faults/${f.id}`)).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Fault map <span className="text-base font-normal text-slate-500">({pins.length} open with GPS)</span></h1>
      <p className="text-sm text-slate-600">Click a marker to open the fault. Red = critical, orange = high, yellow = medium, grey = low. Clusters of markers show hotspots. <Link className="text-brand underline" href="/admin/faults?status=open">Switch to list</Link></p>
      <FaultsMap pins={pins} height={560} />
    </div>
  );
}
