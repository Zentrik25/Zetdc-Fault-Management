"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "./api";

export function NewAnnouncement() {
  const router = useRouter();
  const empty = { kind: "planned", title: "", body: "", area: "", starts_at: "", ends_at: "" };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form
      className="card grid sm:grid-cols-2 gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr("");
        const r = await send("/api/admin/announcements", f);
        setBusy(false);
        if (!r.ok) return setErr(r.error!);
        setF(empty);
        router.refresh();
      }}
    >
      <h2 className="font-semibold sm:col-span-2">Publish a notice</h2>
      <select className="input" value={f.kind} onChange={up("kind")}>
        <option value="planned">Planned maintenance</option>
        <option value="alert">Emergency / alert</option>
      </select>
      <input className="input" placeholder="Affected area (e.g. Avondale, Harare)" value={f.area} onChange={up("area")} />
      <input className="input sm:col-span-2" placeholder="Title" value={f.title} onChange={up("title")} required />
      <textarea className="input sm:col-span-2" rows={2} placeholder="Details for customers" value={f.body} onChange={up("body")} required />
      <div><label className="label">Starts (optional)</label><input type="datetime-local" className="input" value={f.starts_at} onChange={up("starts_at")} /></div>
      <div><label className="label">Ends (optional — notice hides after this)</label><input type="datetime-local" className="input" value={f.ends_at} onChange={up("ends_at")} /></div>
      <button className="btn sm:col-span-2" disabled={busy}>Publish notice</button>
      {err && <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 rounded p-2">{err}</p>}
    </form>
  );
}

export function DeleteAnnouncement({ id }: { id: number }) {
  const router = useRouter();
  return (
    <button
      className="text-xs text-red-700 border border-red-300 rounded px-2 py-1 hover:bg-red-50"
      onClick={async () => {
        await send(`/api/admin/announcements/${id}`, undefined, "DELETE");
        router.refresh();
      }}
    >
      Remove
    </button>
  );
}
