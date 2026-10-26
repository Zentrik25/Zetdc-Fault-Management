import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { canView, getEvents, getFault, getPhotoIds } from "@/lib/faults";
import FaultInfo from "@/components/FaultInfo";
import Timeline from "@/components/Timeline";
import StaffActions from "@/components/StaffActions";
import FaultsMap from "@/components/FaultsMap";
import { toPin } from "@/lib/pins";
import { typeLabel } from "@/lib/constants";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const u = await requirePage("admin", "technician");
  const id = Number((await params).id);
  const f = Number.isInteger(id) ? await getFault(id) : null;
  if (!f || !(await canView(u, f))) notFound();
  const isAdmin = u.role === "admin";
  const [events, photos, techs, cands] = await Promise.all([
    getEvents(f.id, true),
    getPhotoIds(f.id),
    isAdmin ? query<{ id: number; name: string }>("SELECT id, name FROM users WHERE role='technician' AND active ORDER BY name") : [],
    isAdmin
      ? query<{ id: number; ticket: string; type: string; suburb: string | null; address: string }>(
          `SELECT id, ticket, type, suburb, address FROM faults
           WHERE id<>$1 AND duplicate_of IS NULL AND status IN ('reported','acknowledged','assigned','in_progress')
           ORDER BY (city=$2) DESC, (type=$3) DESC, created_at DESC LIMIT 25`,
          [f.id, f.city, f.type],
        )
      : [],
  ]);
  const pin = toPin(f);
  return (
    <div className="space-y-4">
      <Link href="/admin/faults" className="text-sm text-brand">← All faults</Link>
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <FaultInfo f={f} photos={photos} staff />
          {pin && <FaultsMap pins={[pin]} height={260} />}
          <div className="card">
            <h2 className="font-normal mb-3">History</h2>
            <Timeline events={events} />
          </div>
        </div>
        <div className="lg:col-span-2">
          {f.duplicate_of && <div className="card mb-4 text-sm bg-slate-50">This report was merged into another fault.</div>}
          <StaffActions
            faultId={f.id}
            status={f.status}
            priority={f.priority}
            assignedTo={f.assigned_to}
            techs={techs}
            isAdmin={isAdmin}
            duplicateCandidates={cands.map((c) => ({ id: c.id, ticket: c.ticket, label: `${typeLabel(c.type)} · ${c.suburb ?? c.address}` }))}
          />
        </div>
      </div>
    </div>
  );
}
