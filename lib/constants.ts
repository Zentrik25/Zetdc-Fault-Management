// Shared by server and client code — keep free of server-only imports.

export const FAULT_TYPES = [
  { value: "no_power", label: "No power (outage)", icon: "🔌" },
  { value: "partial_power", label: "Partial power / one phase", icon: "💡" },
  { value: "low_voltage", label: "Low voltage", icon: "📉" },
  { value: "high_voltage", label: "High voltage / surges", icon: "📈" },
  { value: "transformer", label: "Transformer fault", icon: "🏭" },
  { value: "line_down", label: "Fallen / broken power line", icon: "⚡" },
  { value: "sparking", label: "Sparking / fire hazard", icon: "🔥" },
  { value: "meter", label: "Faulty meter / prepaid token", icon: "🔢" },
  { value: "street_light", label: "Street light", icon: "🛣️" },
  { value: "vandalism", label: "Vandalism / cable theft", icon: "🚨" },
  { value: "other", label: "Other", icon: "❓" },
] as const;
export type FaultType = (typeof FAULT_TYPES)[number]["value"];
export const FAULT_TYPE_VALUES = FAULT_TYPES.map((t) => t.value) as string[];
export const typeLabel = (v: string) =>
  FAULT_TYPES.find((t) => t.value === v)?.label ?? v;
export const typeIcon = (v: string) =>
  FAULT_TYPES.find((t) => t.value === v)?.icon ?? "❓";

export const STATUSES = [
  "reported",
  "acknowledged",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<string, string> = {
  reported: "Reported",
  acknowledged: "Acknowledged",
  assigned: "Crew assigned",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};
export const STATUS_COLOR: Record<string, string> = {
  reported: "bg-amber-100 text-amber-800",
  acknowledged: "bg-sky-100 text-sky-800",
  assigned: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-violet-100 text-violet-800",
  resolved: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-700",
};
export const OPEN_STATUSES = ["reported", "acknowledged", "assigned", "in_progress"];

export const PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type Priority = (typeof PRIORITIES)[number];
export const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-600 text-white",
};
// Target hours to resolve a fault, by priority (SLA).
export const SLA_HOURS: Record<string, number> = {
  critical: 4,
  high: 12,
  medium: 24,
  low: 72,
};

export const CITIES = [
  "Harare",
  "Bulawayo",
  "Chitungwiza",
  "Mutare",
  "Gweru",
  "Kwekwe",
  "Kadoma",
  "Masvingo",
  "Chinhoyi",
  "Marondera",
  "Bindura",
  "Victoria Falls",
  "Hwange",
  "Other",
];

export const DEFAULT_CENTER: [number, number] = [-17.8292, 31.0522]; // Harare

export const ROLES = ["customer", "technician", "admin"] as const;
export type Role = (typeof ROLES)[number];

export function defaultPriority(type: string, danger: boolean): Priority {
  if (danger) return "critical";
  if (type === "line_down" || type === "sparking") return "high";
  if (type === "transformer" || type === "no_power" || type === "vandalism")
    return "medium";
  return "low";
}

export function isOverdue(f: {
  status: string;
  priority: string;
  created_at: Date | string;
}) {
  if (!OPEN_STATUSES.includes(f.status)) return false;
  const hrs = (Date.now() - new Date(f.created_at).getTime()) / 36e5;
  return hrs > (SLA_HOURS[f.priority] ?? 24);
}

export function timeAgo(d: Date | string) {
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

export function fmtDateTime(d: Date | string) {
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Harare",
  });
}

export function distanceM(a: [number, number], b: [number, number]) {
  const R = 6371000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
