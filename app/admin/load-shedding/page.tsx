import { requirePage } from "@/lib/auth";
import { fmtDay, upcomingShedding } from "@/lib/public";
import { DeleteShedding, NewShedding } from "@/components/SheddingAdmin";

export default async function Page() {
  await requirePage("admin");
  const rows = await upcomingShedding();
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Load shedding schedule</h1>
      <p className="text-sm text-slate-600">Slots appear for customers on the Load shedding page. Past dates hide automatically.</p>
      <NewShedding />
      {rows.length === 0 && <div className="card text-slate-500 text-center py-6">No upcoming slots.</div>}
      {rows.map((r) => (
        <div key={r.id} className="card flex items-center justify-between gap-3 text-sm">
          <div>
            <div className="font-semibold">{r.area}, {r.city} {r.stage && <span className="text-amber-700">· Stage {r.stage}</span>}</div>
            <div className="text-slate-600">{fmtDay(r.d)} · {r.start} – {r.end}{r.note ? ` · ${r.note}` : ""}</div>
          </div>
          <DeleteShedding id={r.id} />
        </div>
      ))}
    </div>
  );
}
