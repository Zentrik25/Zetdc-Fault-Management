import { PRIORITY_COLOR, STATUS_COLOR, STATUS_LABEL } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`text-xs font-medium rounded px-2 py-0.5 ${STATUS_COLOR[status] ?? ""}`}>{STATUS_LABEL[status] ?? status}</span>;
}
export function PriorityBadge({ priority }: { priority: string }) {
  return <span className={`text-xs font-medium rounded px-2 py-0.5 capitalize ${PRIORITY_COLOR[priority] ?? ""}`}>{priority}</span>;
}
export function Stat({ label, value, tone = "" }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="card">
      <div className="text-xs font-normal text-muted uppercase tracking-widest">{label}</div>
      <div className={`text-3xl font-light tnum mt-1 ${tone}`}>{value}</div>
    </div>
  );
}
export function Bar({ label, value, max, color = "bg-brand" }: { label: string; value: number; max: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="w-40 truncate text-slate-600">{label}</div>
      <div className="flex-1 bg-slate-100 rounded h-3">
        <div className={`${color} h-3 rounded`} style={{ width: `${max && value ? Math.max(3, (value / max) * 100) : 0}%` }} />
      </div>
      <div className="w-8 text-right font-semibold">{value}</div>
    </div>
  );
}
