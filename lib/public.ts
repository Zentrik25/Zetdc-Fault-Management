import "server-only";
import { query } from "./db";

export type Announcement = { id: number; kind: string; title: string; body: string; area: string | null; starts_at: Date | null; ends_at: Date | null; created_at: Date };

/** Announcements that have not ended yet. */
export const activeAnnouncements = () =>
  query<Announcement>(
    "SELECT * FROM announcements WHERE ends_at IS NULL OR ends_at > now() ORDER BY (kind='alert') DESC, starts_at NULLS FIRST, created_at DESC LIMIT 20",
  );
