import { getUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import NavBar from "./NavBar";

export default async function Nav() {
  const user = await getUser();
  let unread = 0;
  if (user) {
    const r = await queryOne<{ n: number }>("SELECT count(*)::int AS n FROM notifications WHERE user_id=$1 AND NOT read", [user.id]);
    unread = r?.n ?? 0;
  }
  const groups: { title: string; links: [string, string, string][] }[] = [{ title: "Explore", links: [["/", "Home", "🏠"], ["/outages", "Outage map", "🗺️"], ["/load-shedding", "Load shedding", "⏱️"]] }];
  if (user?.role === "customer") {
    groups.push({ title: "My account", links: [["/report", "Report a fault", "⚡"], ["/my-faults", "My faults", "📋"], ["/notifications", "Notifications", "🔔"]] });
  } else if (user) {
    const staff: [string, string, string][] = [["/admin", "Dashboard", "📊"], ["/admin/faults", "Faults", "📋"], ["/admin/map", "Fault map", "📍"]];
    if (user.role === "admin")
      staff.push(["/admin/users", "Users", "👥"], ["/admin/announcements", "Announcements", "📢"], ["/admin/load-shedding", "Load shedding schedule", "🗓️"]);
    groups.push({ title: user.role === "admin" ? "Control room" : "Technician", links: [...staff, ["/notifications", "Notifications", "🔔"]] });
  }
  return <NavBar user={user ? { name: user.name, role: user.role } : null} unread={unread} groups={groups} />;
}
