import { STATUSES, STATUS_LABEL, fmtDateTime, typeIcon, typeLabel, STATUS_COLOR } from "@/lib/constants";
import type { FaultRow } from "@/lib/types";
import { PriorityBadge, StatusBadge } from "./ui";

export function ProgressBar({ status }: { status: string }) {
  const steps = STATUSES.filter((s) => s !== "closed");
  const idx = status === "closed" ? -1 : steps.indexOf(status as never);
  if (status === "closed") return <StatusBadge status="closed" />;
  return (
    <div className="flex items-center gap-1 text-[11px] sm:text-xs">
      {steps.map((s, i) => (
        <div key={s} className="flex-1">
          <div className={`h-2 rounded-full ${i <= idx ? "bg-brand" : "bg-slate-200"}`} />
          <div className={`mt-1 text-center ${i === idx ? "font-bold text-brand" : "text-slate-500"}`}>{STATUS_LABEL[s]}</div>
        </div>
      ))}
    </div>
  );
}

export default function FaultInfo({ f, photos, staff }: { f: FaultRow; photos: number[]; staff?: boolean }) {
  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-xs text-slate-500">{f.ticket}</div>
          <h1 className="text-xl font-bold">{typeIcon(f.type)} {typeLabel(f.type)}</h1>
        </div>
        <div className="flex gap-2 items-center">
          {f.danger && <span className="text-xs bg-red-600 text-white rounded px-2 py-1 font-bold">DANGER</span>}
          {staff && <PriorityBadge priority={f.priority} />}
          <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${STATUS_COLOR[f.status]}`}>{STATUS_LABEL[f.status]}</span>
        </div>
      </div>
      <ProgressBar status={f.status} />
      <p className="whitespace-pre-wrap">{f.description}</p>
      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <div><dt className="inline text-slate-500">Location: </dt><dd className="inline">{f.suburb ? `${f.suburb}, ` : ""}{f.city} — {f.address}</dd></div>
        <div><dt className="inline text-slate-500">Reported: </dt><dd className="inline">{fmtDateTime(f.created_at)}</dd></div>
        {f.meter_number && <div><dt className="inline text-slate-500">Meter: </dt><dd className="inline">{f.meter_number}</dd></div>}
        <div><dt className="inline text-slate-500">Crew: </dt><dd className="inline">{f.tech_name ?? "Not yet assigned"}</dd></div>
        {(f.followers ?? 0) > 0 && <div><dt className="inline text-slate-500">Affected: </dt><dd className="inline">{f.followers! + 1} customers</dd></div>}
        {f.resolved_at && <div><dt className="inline text-slate-500">Resolved: </dt><dd className="inline">{fmtDateTime(f.resolved_at)}</dd></div>}
        {staff && (
          <>
            <div><dt className="inline text-slate-500">Customer: </dt><dd className="inline">{f.reporter_name} · {f.reporter_phone ?? "no phone"} · {f.reporter_email}</dd></div>
            {f.lat != null && (
              <div><dt className="inline text-slate-500">GPS: </dt>
                <dd className="inline"><a className="text-brand underline" target="_blank" href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}>Navigate ↗</a></dd></div>
            )}
          </>
        )}
      </dl>
      {f.resolution_note && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm"><b>Resolution:</b> {f.resolution_note}</div>
      )}
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((id) => (
            <a key={id} href={`/api/photos/${id}`} target="_blank">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/photos/${id}`} alt="Fault photo" className="h-28 w-28 object-cover rounded-lg border" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
