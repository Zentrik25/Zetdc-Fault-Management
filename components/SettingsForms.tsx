"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PRIORITIES } from "@/lib/constants";
import { send } from "./api";

function Msg({ err, done }: { err: string; done: string }) {
  if (err) return <p className="text-sm text-red-600 bg-red-50 rounded p-2">{err}</p>;
  if (done) return <p className="text-sm text-emerald-700 bg-emerald-50 rounded p-2">{done}</p>;
  return null;
}

export function ProfileForm({ name: n0, phone: p0, email }: { name: string; phone: string | null; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(n0);
  const [phone, setPhone] = useState(p0 ?? "");
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="card space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setErr(""); setDone("");
        const r = await send("/api/settings/profile", { name, phone }, "PATCH");
        setBusy(false);
        if (!r.ok) return setErr(r.error!);
        setDone("Profile updated.");
        router.refresh();
      }}
    >
      <div>
        <h2 className="text-lg font-normal">Profile</h2>
        <p className="text-sm text-muted">Technicians use your phone number to reach you about a fault.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Full name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} /></div>
        <div><label className="label">Phone number</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0772 123 456" /></div>
        <div className="sm:col-span-2"><label className="label">Email (used to log in)</label><input className="input bg-slate-50" value={email} readOnly /></div>
      </div>
      <Msg err={err} done={done} />
      <button className="btn" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form
      className="card space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(""); setDone("");
        if (f.next !== f.confirm) return setErr("The new passwords do not match.");
        setBusy(true);
        const r = await send("/api/settings/password", { current: f.current, next: f.next });
        setBusy(false);
        if (!r.ok) return setErr(r.error!);
        setF({ current: "", next: "", confirm: "" });
        setDone("Password changed.");
      }}
    >
      <h2 className="text-lg font-normal">Change password</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Current password</label><input className="input" type="password" autoComplete="current-password" value={f.current} onChange={up("current")} required /></div>
        <div><label className="label">New password</label><input className="input" type="password" autoComplete="new-password" minLength={6} value={f.next} onChange={up("next")} required /></div>
        <div><label className="label">Confirm new password</label><input className="input" type="password" autoComplete="new-password" minLength={6} value={f.confirm} onChange={up("confirm")} required /></div>
      </div>
      <Msg err={err} done={done} />
      <button className="btn" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
    </form>
  );
}

export function SystemForm({ sla, registrationOpen }: { sla: Record<string, number>; registrationOpen: boolean }) {
  const router = useRouter();
  const [hours, setHours] = useState<Record<string, string>>(Object.fromEntries(PRIORITIES.map((p) => [p, String(sla[p])])));
  const [open, setOpen] = useState(registrationOpen);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="card space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setErr(""); setDone("");
        const r = await send("/api/admin/settings", { sla: hours, registration_open: open }, "PATCH");
        setBusy(false);
        if (!r.ok) return setErr(r.error!);
        setDone("System settings saved.");
        router.refresh();
      }}
    >
      <div>
        <h2 className="text-lg font-normal">System settings <span className="text-xs text-muted">(admin)</span></h2>
        <p className="text-sm text-muted">Target time to fix a fault. Faults still open after this many hours are flagged OVERDUE.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PRIORITIES.map((p) => (
          <div key={p}>
            <label className="label capitalize">{p} priority (hours)</label>
            <input className="input tnum" type="number" min={1} max={720} value={hours[p]} onChange={(e) => setHours({ ...hours, [p]: e.target.value })} required />
          </div>
        ))}
      </div>
      <label className="flex items-start gap-3 text-sm cursor-pointer">
        <input type="checkbox" className="mt-1 h-4 w-4" checked={open} onChange={(e) => setOpen(e.target.checked)} />
        <span><b className="font-medium text-ink">Allow new customer sign-ups</b><br /><span className="text-muted">Turn off to stop new accounts being created. Existing users are not affected.</span></span>
      </label>
      <Msg err={err} done={done} />
      <button className="btn" disabled={busy}>{busy ? "Saving…" : "Save system settings"}</button>
    </form>
  );
}
