import "server-only";
import { query } from "./db";

export type Announcement = { id: number; kind: string; title: string; body: string; area: string | null; starts_at: Date | null; ends_at: Date | null; created_at: Date };

/** Announcements that have not ended yet. */
export const activeAnnouncements = () =>
  query<Announcement>(
    "SELECT * FROM announcements WHERE ends_at IS NULL OR ends_at > now() ORDER BY (kind='alert') DESC, starts_at NULLS FIRST, created_at DESC LIMIT 20",
  );

export type SheddingRow = { id: number; city: string; area: string; d: string; start: string; end: string; stage: number | null; note: string | null };

/** Load-shedding slots from today onwards (Harare time). */
export const upcomingShedding = (city?: string) =>
  query<SheddingRow>(
    `SELECT id, city, area, to_char(shed_date,'YYYY-MM-DD') AS d, to_char(start_time,'HH24:MI') AS start,
            to_char(end_time,'HH24:MI') AS "end", stage, note
     FROM load_shedding
     WHERE shed_date >= (now() AT TIME ZONE 'Africa/Harare')::date ${city ? "AND city=$1" : ""}
     ORDER BY shed_date, start_time, area LIMIT 300`,
    city ? [city] : [],
  );

export const fmtDay = (d: string) =>
  new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" });
