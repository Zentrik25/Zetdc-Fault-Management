"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "./api";

export function NewUserForm() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", role: "technician" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form
      className="card grid sm:grid-cols-3 gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr("");
        const r = await send("/api/admin/users", f);
        setBusy(false);
        if (!r.ok) return setErr(r.error!);
        setF({ name: "", email: "", phone: "", password: "", role: "technician" });
        router.refresh();
      }}
    >
      <h2 className="font-semibold sm:col-span-3">Add technician / admin</h2>
      <input className="input" placeholder="Full name" value={f.name} onChange={up("name")} required />
      <input className="input" type="email" placeholder="Email" value={f.email} onChange={up("email")} required />
      <input className="input" placeholder="Phone" value={f.phone} onChange={up("phone")} />
      <input className="input" type="password" placeholder="Temporary password (6+)" value={f.password} onChange={up("password")} required minLength={6} />
      <select className="input" value={f.role} onChange={up("role")}>
        <option value="technician">Technician</option>
        <option value="admin">Admin</option>
      </select>
      <button className="btn" disabled={busy}>Create account</button>
      {err && <p className="sm:col-span-3 text-sm text-red-600 bg-red-50 rounded p-2">{err}</p>}
    </form>
  );
}

export function ToggleActive({ id, active, self }: { id: number; active: boolean; self: boolean }) {
  const router = useRouter();
  return (
    <button
      disabled={self}
      className={`text-xs rounded px-2 py-1 border ${active ? "text-red-700 border-red-300 hover:bg-red-50" : "text-emerald-700 border-emerald-300 hover:bg-emerald-50"} disabled:opacity-40`}
      onClick={async () => {
        await send(`/api/admin/users/${id}`, { active: !active }, "PATCH");
        router.refresh();
      }}
    >
      {active ? "Deactivate" : "Activate"}
    </button>
  );
}
