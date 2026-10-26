import type { SessionUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import NavBar, { type Group } from "./NavBar";
import { groupsFor } from "@/lib/nav";

export default async function Nav({ user }: { user: SessionUser | null }) {
  let unread = 0;
  if (user) {
    const r = await queryOne<{ n: number }>("SELECT count(*)::int AS n FROM notifications WHERE user_id=$1 AND NOT read", [user.id]);
    unread = r?.n ?? 0;
  }

  // Logged out: horizontal top bar. Logged in: left sidebar (computers) / drawer (phones).
  const links: [string, string][] = [["/", "Home"], ["/outages", "Outage map"], ["/load-shedding", "Load shedding"]];
  const groups: Group[] = groupsFor(user?.role ?? null);
  return <NavBar user={user ? { name: user.name, role: user.role } : null} unread={unread} links={links} groups={groups} />;
}
