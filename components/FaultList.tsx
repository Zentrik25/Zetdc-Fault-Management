import Link from "next/link";
import { isOverdue, timeAgo, typeIcon, typeLabel } from "@/lib/constants";
import type { FaultRow } from "@/lib/types";
import { getSettings } from "@/lib/settings";
import { PriorityBadge, StatusBadge } from "./ui";

export default async function FaultList({ faults, base, staff = false }: { faults: FaultRow[]; base: string; staff?: boolean }) {
  const { sla } = await getSettings();
  if (!faults.length) return <div className="card text-center text-slate-500 py-10">No faults to show.</div>;
  return (
    <div className="space-y-2">
      {faults.map((f) => (
        <Link key={f.id} href={`${base}/${f.id}`} className="card flex flex-wrap items-center gap-3 hover:border-brand transition">
          <div className="text-2xl">{typeIcon(f.type)}</div>
          <div className="flex-1 min-w-52">
            <div className="font-semibold">
              {typeLabel(f.type)} <span className="text-slate-400 font-normal text-sm">· {f.ticket}</span>
              {f.danger && <span className="ml-2 text-xs bg-red-600 text-white rounded px-1.5 py-0.5">DANGER</span>}
              {isOverdue(f, sla) && <span className="ml-2 text-xs bg-orange-500 text-white rounded px-1.5 py-0.5">OVERDUE</span>}
            </div>
            <div className="text-sm text-slate-600 truncate">
              {f.suburb ? `${f.suburb}, ` : ""}{f.city} — {f.address}
            </div>
            <div className="text-xs text-slate-500">
              {timeAgo(f.created_at)}
              {staff && <> · {f.reporter_name}{f.followers ? ` +${f.followers} more affected` : ""} · {f.tech_name ? `🔧 ${f.tech_name}` : "unassigned"}</>}
              {!staff && f.followers ? ` · ${f.followers + 1} people affected` : ""}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={f.status} />
            {staff && <PriorityBadge priority={f.priority} />}
          </div>
        </Link>
      ))}
    </div>
  );
}
