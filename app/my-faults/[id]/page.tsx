import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { canView, getEvents, getFault, getPhotoIds } from "@/lib/faults";
import FaultInfo from "@/components/FaultInfo";
import Timeline from "@/components/Timeline";
import CustomerActions from "@/components/CustomerActions";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const u = await requirePage("customer");
  const id = Number((await params).id);
  const f = Number.isInteger(id) ? await getFault(id) : null;
  if (!f || !(await canView(u, f))) notFound();
  const [events, photos, sp] = await Promise.all([getEvents(f.id, false), getPhotoIds(f.id), searchParams]);
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href="/my-faults" className="text-sm text-brand">← My faults</Link>
      {sp.new && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4">
          <b>✅ Fault reported!</b> Your ticket number is <b>{f.ticket}</b>. Keep it to track progress — we will update this page and notify you here (🔔) as the crew works on it.
          {f.danger && <div className="mt-1 text-red-700 font-semibold">Stay well away from any fallen lines or sparking equipment.</div>}
        </div>
      )}
      <FaultInfo f={f} photos={photos} />
      <CustomerActions faultId={f.id} status={f.status} rating={f.rating} isOwner={f.user_id === u.id} />
      <div className="card">
        <h2 className="font-semibold mb-3">Updates</h2>
        <Timeline events={events} />
      </div>
    </div>
  );
}
