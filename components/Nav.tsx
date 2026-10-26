import type { SessionUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import NavBar, { type Group } from "./NavBar";

export default async function Nav({ user }: { user: SessionUser | null }) {
  let unread = 0;
  if (user) {
    const r = await queryOne<{ n: number }>("SELECT count(*)::int AS n FROM notifications WHERE user_id=$1 AND NOT read", [user.id]);
    unread = r?.n ?? 0;
  }

  // Logged out: horizontal top bar. Logged in: left sidebar (computers) / drawer (phones).
  const links: [string, string][] = [["/", "Home"], ["/outages", "Outage map"], ["/load-shedding", "Load shedding"]];
  let groups: Group[];
  if (!user) {
    groups = [{ title: "Explore", links: [["/", "Home", "🏠"], ["/outages", "Outage map", "🗺️"], ["/load-shedding", "Load shedding", "⏱️"]] }];
  } else if (user.role === "customer") {
    groups = [
      { title: "Menu", links: [["/dashboard", "Dashboard", "📊"], ["/report", "Report a fault", "⚡"], ["/my-faults", "My faults", "📋"], ["/notifications", "Notifications", "🔔"]] },
      { title: "Explore", links: [["/outages", "Outage map", "🗺️"], ["/load-shedding", "Load shedding", "⏱️"]] },
    ];
  } else if (user.role === "technician") {
    groups = [
      { title: "Work", links: [["/admin", "Dashboard", "📊"], ["/admin/faults", "My faults", "📋"], ["/admin/map", "Fault map", "📍"], ["/notifications", "Notifications", "🔔"]] },
      { title: "Explore", links: [["/outages", "Outage map", "🗺️"], ["/load-shedding", "Load shedding", "⏱️"]] },
    ];
  } else {
    groups = [
      { title: "Control room", links: [["/admin", "Dashboard", "📊"], ["/admin/faults", "Faults", "📋"], ["/admin/map", "Fault map", "📍"], ["/notifications", "Notifications", "🔔"]] },
      { title: "Manage", links: [["/admin/users", "Users", "👥"], ["/admin/announcements", "Announcements", "📢"], ["/admin/load-shedding", "Load shedding", "🗓️"]] },
      { title: "Public site", links: [["/outages", "Outage map", "🗺️"]] },
    ];
  }
  return <NavBar user={user ? { name: user.name, role: user.role } : null} unread={unread} links={links} groups={groups} />;
}
