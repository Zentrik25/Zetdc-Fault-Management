import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { listFaults } from "@/lib/faults";
import { CITIES, FAULT_TYPES, PRIORITIES, STATUSES, STATUS_LABEL } from "@/lib/constants";
import FaultList from "@/components/FaultList";

function FilterSelect({ sp, name, label, opts }: { sp: Record<string, string | undefined>; name: string; label: string; opts: [string, string][] }) {
  return (
    <select name={name} defaultValue={sp[name] ?? ""} className="input !w-auto">
      <option value="">{label}</option>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const u = await requirePage("admin", "technician");
  const sp = await searchParams;
  const faults = await listFaults(u, {
    status: sp.status, priority: sp.priority, type: sp.type, city: sp.city, q: sp.q?.trim(),
    assigned: sp.assigned, overdue: sp.overdue === "1",
  });
  const techs = u.role === "admin" ? await query<{ id: number; name: string }>("SELECT id, name FROM users WHERE role='technician' AND active ORDER BY name") : [];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-light">{u.role === "admin" ? "All faults" : "My assigned faults"} <span className="text-slate-400 text-base font-normal">({faults.length})</span></h1>
      <form className="card flex flex-wrap gap-2 items-center">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search ticket, address, customer…" className="input !w-64" />
        <FilterSelect sp={sp} name="status" label="Any status" opts={[["open", "All open"], ...STATUSES.map((s): [string, string] => [s, STATUS_LABEL[s]])]} />
        <FilterSelect sp={sp} name="priority" label="Any priority" opts={PRIORITIES.map((p): [string, string] => [p, p])} />
        <FilterSelect sp={sp} name="type" label="Any type" opts={FAULT_TYPES.map((t): [string, string] => [t.value, t.label])} />
        <FilterSelect sp={sp} name="city" label="Any city" opts={CITIES.map((c): [string, string] => [c, c])} />
        {u.role === "admin" && <FilterSelect sp={sp} name="assigned" label="Any crew" opts={[["none", "Unassigned"], ...techs.map((t): [string, string] => [String(t.id), t.name])]} />}
        <label className="text-sm flex items-center gap-1"><input type="checkbox" name="overdue" value="1" defaultChecked={sp.overdue === "1"} /> Overdue only</label>
        <button className="btn">Filter</button>
        <Link href="/admin/faults" className="text-sm text-slate-500 underline">Reset</Link>
      </form>
      <FaultList faults={faults} base="/admin/faults" staff />
    </div>
  );
}
