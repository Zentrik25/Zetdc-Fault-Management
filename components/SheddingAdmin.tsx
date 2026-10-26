"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CITIES } from "@/lib/constants";
import { send } from "./api";

export function NewShedding() {
  const router = useRouter();
  const empty = { city: "Harare", area: "", shed_date: "", start_time: "06:00", end_time: "10:00", stage: "", note: "" };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form
      className="card grid sm:grid-cols-2 gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr("");
        const r = await send("/api/admin/load-shedding", f);
        setBusy(false);
        if (!r.ok) return setErr(r.error!);
        setF({ ...empty, city: f.city, shed_date: f.shed_date });
        router.refresh();
      }}
    >
      <h2 className="font-semibold sm:col-span-2">Add a load shedding slot</h2>
      <select className="input" value={f.city} onChange={up("city")}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select>
      <input className="input" placeholder="Area / suburb (e.g. Avondale)" value={f.area} onChange={up("area")} required />
      <div><label className="label">Date</label><input type="date" className="input" value={f.shed_date} onChange={up("shed_date")} required /></div>
      <div><label className="label">Stage (optional)</label>
        <select className="input" value={f.stage} onChange={up("stage")}><option value="">—</option>{[1,2,3,4,5,6,7,8].map((n) => <option key={n}>{n}</option>)}</select></div>
      <div><label className="label">From</label><input type="time" className="input" value={f.start_time} onChange={up("start_time")} required /></div>
      <div><label className="label">To</label><input type="time" className="input" value={f.end_time} onChange={up("end_time")} required /></div>
      <input className="input sm:col-span-2" placeholder="Note (optional)" value={f.note} onChange={up("note")} />
      <button className="btn sm:col-span-2" disabled={busy}>Add slot</button>
      {err && <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 rounded p-2">{err}</p>}
    </form>
  );
}

export function DeleteShedding({ id }: { id: number }) {
  const router = useRouter();
  return (
    <button
      className="text-xs text-red-700 border border-red-300 rounded px-2 py-1.5 hover:bg-red-50"
      onClick={async () => {
        await send(`/api/admin/load-shedding/${id}`, undefined, "DELETE");
        router.refresh();
      }}
    >
      Remove
    </button>
  );
}
