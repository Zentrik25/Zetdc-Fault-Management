import { requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { fmtDateTime } from "@/lib/constants";
import type { Announcement } from "@/lib/public";
import { DeleteAnnouncement, NewAnnouncement } from "@/components/AnnouncementAdmin";

export default async function Page() {
  await requirePage("admin");
  const items = await query<Announcement>("SELECT * FROM announcements ORDER BY created_at DESC LIMIT 50");
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-light">Announcements</h1>
      <p className="text-sm text-slate-600">Notices appear on the home page and outage map for all customers.</p>
      <NewAnnouncement />
      {items.map((a) => {
        const ended = a.ends_at && new Date(a.ends_at) < new Date();
        return (
          <div key={a.id} className={`card flex justify-between gap-3 ${ended ? "opacity-50" : ""}`}>
            <div className="text-sm">
              <div className="font-semibold">{a.kind === "alert" ? "🚨" : "🛠️"} {a.title} {a.area && <span className="font-normal text-slate-500">— {a.area}</span>} {ended && <em className="text-xs">(ended)</em>}</div>
              <div>{a.body}</div>
              <div className="text-xs text-slate-500">{a.starts_at ? fmtDateTime(a.starts_at) : "now"} → {a.ends_at ? fmtDateTime(a.ends_at) : "until removed"}</div>
            </div>
            <DeleteAnnouncement id={a.id} />
          </div>
        );
      })}
    </div>
  );
}
