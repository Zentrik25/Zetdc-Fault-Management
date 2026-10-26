import Link from "next/link";
import { CITIES } from "@/lib/constants";
import { fmtDay, upcomingShedding } from "@/lib/public";

export default async function Page({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const { city } = await searchParams;
  const rows = await upcomingShedding(city && CITIES.includes(city) ? city : undefined);
  const byDay = new Map<string, typeof rows>();
  for (const r of rows) byDay.set(r.d, [...(byDay.get(r.d) ?? []), r]);
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-light">⏱️ Load shedding schedule</h1>
        <p className="text-sm text-slate-600">Planned power cuts by area. Times are Zimbabwe time (CAT). Schedules can change — check back regularly.</p>
      </div>
      <form className="card flex gap-2 items-center">
        <select name="city" defaultValue={city ?? ""} className="input">
          <option value="">All cities and towns</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="btn">Show</button>
        {city && <Link href="/load-shedding" className="text-sm underline text-slate-500">Reset</Link>}
      </form>
      {rows.length === 0 && <div className="card text-center text-slate-500 py-10">No load shedding is scheduled. 🎉</div>}
      {[...byDay.entries()].map(([d, list]) => (
        <section key={d} className="space-y-2">
          <h2 className="font-normal">{fmtDay(d)}</h2>
          {list.map((r) => (
            <div key={r.id} className="card flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="font-mono font-bold text-brand">{r.start} – {r.end}</div>
              <div className="flex-1 min-w-40">
                <div className="font-semibold">{r.area}</div>
                <div className="text-xs text-slate-500">{r.city}{r.note ? ` · ${r.note}` : ""}</div>
              </div>
              {r.stage && <span className="text-xs bg-amber-100 text-amber-800 rounded px-2 py-0.5 font-medium">Stage {r.stage}</span>}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
