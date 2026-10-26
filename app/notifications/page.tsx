import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { fmtDateTime } from "@/lib/constants";
import MarkRead from "@/components/MarkRead";

export default async function Page() {
  const u = await requirePage();
  const rows = await query<{ id: number; fault_id: number | null; message: string; read: boolean; created_at: Date }>(
    "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
    [u.id],
  );
  const base = u.role === "customer" ? "/my-faults" : "/admin/faults";
  const hasUnread = rows.some((r) => !r.read);
  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <h1 className="text-2xl font-light">Notifications</h1>
      {hasUnread && <MarkRead />}
      {rows.length === 0 && <div className="card text-slate-500 text-center py-8">Nothing yet.</div>}
      {rows.map((n) => (
        <Link key={n.id} href={n.fault_id ? `${base}/${n.fault_id}` : "#"} className={`card block ${n.read ? "" : "border-brand bg-blue-50"}`}>
          <div className="text-sm">{n.message}</div>
          <div className="text-xs text-slate-500">{fmtDateTime(n.created_at)}</div>
        </Link>
      ))}
    </div>
  );
}
