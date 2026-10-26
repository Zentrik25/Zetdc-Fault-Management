import { fmtDateTime } from "@/lib/constants";
import type { EventRow } from "@/lib/types";

const ICON: Record<string, string> = {
  created: "📝", status: "🔄", assign: "🔧", comment: "💬", note: "🔒", priority: "🚩", reopen: "↩️", rating: "⭐", duplicate: "🔗",
};

export default function Timeline({ events }: { events: EventRow[] }) {
  return (
    <ol className="space-y-3 border-l-2 border-slate-200 ml-2 pl-4">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[26px] top-0 bg-white text-sm">{ICON[e.kind] ?? "•"}</span>
          <div className={`text-sm rounded-lg p-2 ${e.internal ? "bg-yellow-50 border border-yellow-200" : e.kind === "comment" ? "bg-slate-50 border" : ""}`}>
            {e.internal && <span className="text-[10px] font-bold text-yellow-700 mr-1">INTERNAL</span>}
            {e.message}
            <div className="text-xs text-slate-500 mt-0.5">
              {e.user_name ? `${e.user_name}${e.user_role && e.user_role !== "customer" ? ` (${e.user_role === "admin" ? "ZETDC control" : "technician"})` : ""} · ` : ""}
              {fmtDateTime(e.created_at)}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
