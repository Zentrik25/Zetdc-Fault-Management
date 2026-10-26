import { fmtDateTime } from "@/lib/constants";
import type { Announcement } from "@/lib/public";

export default function Announcements({ items }: { items: Announcement[] }) {
  if (!items.length) return null;
  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-lg">📢 Notices</h2>
      {items.map((a) => (
        <div key={a.id} className={`rounded-xl border p-3 text-sm ${a.kind === "alert" ? "bg-red-50 border-red-300" : "bg-amber-50 border-amber-300"}`}>
          <div className="font-semibold">
            {a.kind === "alert" ? "🚨 " : "🛠️ "}{a.title}
            {a.area && <span className="font-normal text-slate-600"> — {a.area}</span>}
          </div>
          <div>{a.body}</div>
          {(a.starts_at || a.ends_at) && (
            <div className="text-xs text-slate-600 mt-1">
              {a.starts_at && <>From {fmtDateTime(a.starts_at)} </>}
              {a.ends_at && <>until {fmtDateTime(a.ends_at)}</>}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
