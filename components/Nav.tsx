import Link from "next/link";
import { getUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import LogoutButton from "./LogoutButton";

export default async function Nav() {
  const user = await getUser();
  let unread = 0;
  if (user) {
    const r = await queryOne<{ n: number }>("SELECT count(*)::int AS n FROM notifications WHERE user_id=$1 AND NOT read", [user.id]);
    unread = r?.n ?? 0;
  }
  const links =
    user?.role === "customer"
      ? [
          ["/report", "Report fault"],
          ["/my-faults", "My faults"],
          ["/outages", "Outage map"],
        ]
      : user
        ? [
            ["/admin", "Dashboard"],
            ["/admin/faults", "Faults"],
            ["/admin/map", "Map"],
            ...(user.role === "admin"
              ? [
                  ["/admin/users", "Users"],
                  ["/admin/announcements", "Announcements"],
                ]
              : []),
          ]
        : [["/outages", "Outage map"]];
  return (
    <header className="bg-brand text-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="bg-accent text-brand-dark rounded-md px-2 py-0.5">⚡</span> ZETDC <span className="font-normal opacity-80 hidden sm:inline">Fault Management</span>
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm flex-1">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="opacity-90 hover:opacity-100 hover:underline">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/notifications" className="relative" title="Notifications">
                🔔
                {unread > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                    {unread}
                  </span>
                )}
              </Link>
              <span className="hidden sm:inline opacity-90">
                {user.name} <span className="text-xs opacity-70">({user.role})</span>
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Log in</Link>
              <Link href="/register" className="bg-accent text-brand-dark font-semibold rounded-md px-3 py-1.5">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
