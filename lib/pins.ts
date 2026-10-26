import { STATUS_LABEL, typeLabel } from "./constants";

export const PIN_COLOR: Record<string, string> = {
  critical: "#dc2626",
  high: "#f97316",
  medium: "#eab308",
  low: "#64748b",
};

export function toPin(
  f: { id: number; ticket: string; type: string; status: string; priority: string; suburb: string | null; city: string; lat: number | null; lng: number | null },
  href?: string,
) {
  if (f.lat == null || f.lng == null) return null;
  return {
    lat: f.lat,
    lng: f.lng,
    color: PIN_COLOR[f.priority] ?? "#64748b",
    label: `<b>${typeLabel(f.type)}</b><br>${f.ticket}<br>${f.suburb ? f.suburb + ", " : ""}${f.city}<br>${STATUS_LABEL[f.status]}`,
    href,
  };
}
