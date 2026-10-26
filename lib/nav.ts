import type { Role } from "./constants";
import type { Group } from "@/components/NavBar";

/** Navigation groups per role (also used by global search to find pages). */
export function groupsFor(role: Role | null): Group[] {
  if (!role) return [{ title: "Explore", links: [["/", "Home", "🏠"], ["/outages", "Outage map", "🗺️"], ["/load-shedding", "Load shedding", "⏱️"]] }];
  if (role === "customer")
    return [
      { title: "Menu", links: [["/dashboard", "Dashboard", "📊"], ["/report", "Report a fault", "⚡"], ["/my-faults", "My faults", "📋"], ["/notifications", "Notifications", "🔔"]] },
      { title: "Explore", links: [["/outages", "Outage map", "🗺️"], ["/load-shedding", "Load shedding", "⏱️"]] },
    ];
  if (role === "technician")
    return [
      { title: "Work", links: [["/admin", "Dashboard", "📊"], ["/admin/faults", "My faults", "📋"], ["/admin/map", "Fault map", "📍"], ["/notifications", "Notifications", "🔔"]] },
      { title: "Explore", links: [["/outages", "Outage map", "🗺️"], ["/load-shedding", "Load shedding", "⏱️"]] },
    ];
  return [
    { title: "Control room", links: [["/admin", "Dashboard", "📊"], ["/admin/faults", "Faults", "📋"], ["/admin/map", "Fault map", "📍"], ["/notifications", "Notifications", "🔔"]] },
    { title: "Manage", links: [["/admin/users", "Users", "👥"], ["/admin/announcements", "Announcements", "📢"], ["/admin/load-shedding", "Load shedding", "🗓️"]] },
    { title: "Public site", links: [["/outages", "Outage map", "🗺️"], ["/load-shedding", "Load shedding (public)", "⏱️"]] },
  ];
}
