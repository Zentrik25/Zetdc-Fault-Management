import "server-only";
import { query } from "./db";

/** In-app notification (replaces e-mail/SMS for this project). */
export async function notify(userIds: (number | null | undefined)[], faultId: number, message: string, exceptUser?: number) {
  const ids = [...new Set(userIds.filter((x): x is number => !!x && x !== exceptUser))];
  for (const id of ids) {
    await query("INSERT INTO notifications (user_id, fault_id, message) VALUES ($1,$2,$3)", [id, faultId, message]);
  }
}

export async function addEvent(
  faultId: number,
  userId: number | null,
  kind: "created" | "status" | "assign" | "comment" | "note" | "priority" | "reopen" | "rating" | "duplicate",
  message: string,
  internal = false,
) {
  await query("INSERT INTO fault_events (fault_id, user_id, kind, internal, message) VALUES ($1,$2,$3,$4,$5)", [
    faultId,
    userId,
    kind,
    internal,
    message,
  ]);
}
