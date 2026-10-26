import "server-only";
import { query } from "./db";
import { SLA_HOURS } from "./constants";

export type Settings = { sla: Record<string, number>; registrationOpen: boolean };

/** System settings editable by admins (falls back to defaults when unset). */
export async function getSettings(): Promise<Settings> {
  const rows = await query<{ key: string; value: string }>("SELECT key, value FROM settings");
  const m = new Map(rows.map((r) => [r.key, r.value]));
  const sla = { ...SLA_HOURS };
  for (const p of Object.keys(sla)) {
    const v = Number(m.get(`sla_${p}`));
    if (Number.isFinite(v) && v > 0) sla[p] = v;
  }
  return { sla, registrationOpen: m.get("registration_open") !== "false" };
}

export async function setSetting(key: string, value: string) {
  await query("INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value", [key, value]);
}
