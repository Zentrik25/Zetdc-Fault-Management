import { getUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import NavBar, { type Group } from "./NavBar";

export default async function Nav() {
  const user = await getUser();
  let unread = 0;
  if (user) {
    const r = await queryOne<{ n: number }>("SELECT count(*)::int AS n FROM notifications WHERE user_id=$1 AND NOT read", [user.id]);
    unread = r?.n ?? 0;
  }

  // `links` = the horizontal bar on computers; `groups` = the hamburger drawer on phones.
  let links: [string, string][];
  let groups: Group[];
  if (!user) {
    links = [["/", "Home"], ["/outages", "Outage map"], ["/load-shedding", "Load shedding"]];
    groups = [{ title: "Explore", links: [["/", "Home", "🏠"], ["/outages", "Outage map", "🗺️"], ["/load-shedding", "Load shedding", "⏱️"]] }];
  } else if (user.role === "customer") {
    links = [["/dashboard", "Dashboard"], ["/report", "Report a fault"], ["/my-faults", "My faults"], ["/outages", "Outage map"], ["/load-shedding", "Load shedding"]];
    groups = [
      { title: "My account", links: [["/dashboard", "Dashboard", "📊"], ["/report", "Report a fault", "⚡"], ["/my-faults", "My faults", "📋"], ["/notifications", "Notifications", "🔔"]] },
      { title: "Explore", links: [["/outages", "Outage map", "🗺️"], ["/load-shedding", "Load shedding", "⏱️"], ["/", "Website home", "🏠"]] },
    ];
  } else {
    const staff: [string, string, string][] = [["/admin", "Dashboard", "📊"], ["/admin/faults", "Faults", "📋"], ["/admin/map", "Fault map", "📍"]];
    links = [["/admin", "Dashboard"], ["/admin/faults", "Faults"], ["/admin/map", "Map"]];
    if (user.role === "admin") {
      staff.push(["/admin/users", "Users", "👥"], ["/admin/announcements", "Announcements", "📢"], ["/admin/load-shedding", "Load shedding schedule", "🗓️"]);
      links.push(["/admin/users", "Users"], ["/admin/announcements", "Announcements"], ["/admin/load-shedding", "Load shedding"]);
    }
    groups = [
      { title: user.role === "admin" ? "Control room" : "Technician", links: [...staff, ["/notifications", "Notifications", "🔔"]] },
      { title: "Explore", links: [["/outages", "Outage map", "🗺️"], ["/", "Website home", "🏠"]] },
    ];
  }
  return <NavBar user={user ? { name: user.name, role: user.role } : null} unread={unread} links={links} groups={groups} />;
}
