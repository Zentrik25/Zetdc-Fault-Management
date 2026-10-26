"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "./api";

export default function CustomerActions({
  faultId, status, rating, isOwner,
}: { faultId: number; status: string; rating: number | null; isOwner: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [reason, setReason] = useState("");
  const [showReopen, setShowReopen] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function act(url: string, body: unknown, after?: () => void) {
    setBusy(true);
    setErr("");
    const r = await send(url, body);
    setBusy(false);
    if (!r.ok) return setErr(r.error!);
    after?.();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {isOwner && status === "resolved" && (
        <div className="card space-y-3 border-emerald-300">
          <h3 className="font-semibold">Was the fault fixed?</h3>
          {rating ? (
            <p className="text-sm">Thanks for rating: {"⭐".repeat(rating)}</p>
          ) : (
            <>
              <div className="flex gap-1 text-3xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setStars(n)} className={n <= stars ? "" : "grayscale opacity-40"}>⭐</button>
                ))}
              </div>
              <input className="input" placeholder="Any feedback? (optional)" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
              <button className="btn" disabled={!stars || busy} onClick={() => act(`/api/faults/${faultId}/rate`, { rating: stars, feedback })}>Submit rating</button>
            </>
          )}
          {!showReopen ? (
            <button className="btn btn-ghost" onClick={() => setShowReopen(true)}>No, it is still not fixed</button>
          ) : (
            <div className="space-y-2">
              <textarea className="input" rows={2} placeholder="What is still wrong?" value={reason} onChange={(e) => setReason(e.target.value)} />
              <button className="btn btn-danger" disabled={busy} onClick={() => act(`/api/faults/${faultId}/reopen`, { reason })}>Reopen fault</button>
            </div>
          )}
        </div>
      )}
      {status !== "closed" && (
        <form
          className="card space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            act(`/api/faults/${faultId}/comments`, { message: msg }, () => setMsg(""));
          }}
        >
          <label className="label">Send a message to the ZETDC crew</label>
          <textarea className="input" rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} required />
          <button className="btn" disabled={busy}>Send</button>
        </form>
      )}
      {err && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{err}</p>}
    </div>
  );
}
