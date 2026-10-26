"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PRIORITIES, STATUSES, STATUS_LABEL } from "@/lib/constants";
import { send } from "./api";

type Tech = { id: number; name: string };

export default function StaffActions({
  faultId, status, priority, assignedTo, techs, isAdmin, duplicateCandidates,
}: {
  faultId: number; status: string; priority: string; assignedTo: number | null; techs: Tech[]; isAdmin: boolean;
  duplicateCandidates: { id: number; ticket: string; label: string }[];
}) {
  const router = useRouter();
  const [st, setSt] = useState(status);
  const [pr, setPr] = useState(priority);
  const [tech, setTech] = useState(assignedTo ? String(assignedTo) : "");
  const [note, setNote] = useState("");
  const [comment, setComment] = useState("");
  const [internal, setInternal] = useState(false);
  const [dup, setDup] = useState("");
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(url: string, body: unknown, method = "POST", done = "Saved.") {
    setBusy(true);
    setErr("");
    setOkMsg("");
    const r = await send(url, body, method);
    setBusy(false);
    if (!r.ok) return setErr(r.error!);
    setOkMsg(done);
    setNote("");
    setComment("");
    router.refresh();
  }

  const statusOptions = isAdmin ? STATUSES : (["acknowledged", "in_progress", "resolved"] as const);
  const needsNote = st === "resolved" || st === "closed";

  async function save() {
    const body: Record<string, unknown> = {};
    if (st !== status) body.status = st;
    if (isAdmin && pr !== priority) body.priority = pr;
    if (isAdmin && tech !== (assignedTo ? String(assignedTo) : "")) body.assigned_to = tech ? Number(tech) : null;
    if (needsNote && st !== status) body.resolution_note = note;
    if (!Object.keys(body).length) return setErr("Nothing to update.");
    await run(`/api/faults/${faultId}`, body, "PATCH", "Fault updated and the customer was notified.");
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <h2 className="font-normal">Manage fault</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Status</label>
            <select className="input" value={st} onChange={(e) => setSt(e.target.value)}>
              {!statusOptions.includes(st as never) && <option value={st}>{STATUS_LABEL[st]}</option>}
              {statusOptions.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>
          {isAdmin && (
            <>
              <div>
                <label className="label">Priority</label>
                <select className="input capitalize" value={pr} onChange={(e) => setPr(e.target.value)}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Assign crew</label>
                <select className="input" value={tech} onChange={(e) => setTech(e.target.value)}>
                  <option value="">— unassigned —</option>
                  {techs.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
        {needsNote && st !== status && (
          <div>
            <label className="label">{st === "resolved" ? "Resolution note (what was fixed?)" : "Why is it being closed?"}</label>
            <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        )}
        <button className="btn" disabled={busy} onClick={save}>Save changes</button>
      </div>

      <form
        className="card space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(`/api/faults/${faultId}/comments`, { message: comment, internal }, "POST", internal ? "Internal note added." : "Message sent to customer.");
        }}
      >
        <label className="label">Message / note</label>
        <textarea className="input" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} required />
        <div className="flex items-center gap-4">
          <label className="text-sm flex gap-1 items-center"><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note (customer cannot see)</label>
          <button className="btn" disabled={busy}>{internal ? "Add note" : "Send to customer"}</button>
        </div>
      </form>

      {isAdmin && duplicateCandidates.length > 0 && (
        <div className="card space-y-2">
          <h2 className="font-normal">Merge duplicate</h2>
          <p className="text-xs text-slate-500">If this is the same problem as another open fault, merge it. The customer will follow the original.</p>
          <div className="flex gap-2">
            <select className="input" value={dup} onChange={(e) => setDup(e.target.value)}>
              <option value="">Choose the original fault…</option>
              {duplicateCandidates.map((d) => <option key={d.id} value={d.id}>{d.ticket} — {d.label}</option>)}
            </select>
            <button className="btn btn-ghost" disabled={!dup || busy} onClick={() => run(`/api/faults/${faultId}`, { duplicate_of: Number(dup) }, "PATCH", "Merged.")}>Merge</button>
          </div>
        </div>
      )}
      {err && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{err}</p>}
      {okMsg && <p className="text-sm text-emerald-700 bg-emerald-50 rounded p-2">{okMsg}</p>}
    </div>
  );
}
