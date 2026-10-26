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
    <header className="bg-brand text-white shadow sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ZETDC logo" width={36} height={36} className="h-9 w-9 rounded-full bg-white" /> ZETDC
          <span className="font-normal opacity-80 hidden md:inline">Fault Management</span>
        </Link>
        {user ? (
          <>
            <Link href="/notifications" className="relative p-2 -m-2 text-lg" title="Notifications" aria-label="Notifications">
              🔔
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                  {unread}
                </span>
              )}
            </Link>
            <span className="hidden sm:inline text-sm opacity-90 max-w-48 truncate">
              {user.name} <span className="text-xs opacity-70">({user.role})</span>
            </span>
            <LogoutButton />
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Link href="/login" className="px-2 py-2 hover:underline">Log in</Link>
            <Link href="/register" className="bg-accent text-brand-dark font-semibold rounded-md px-3 py-2">Sign up</Link>
          </div>
        )}
      </div>
      <nav className="bg-brand-dark/60 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar text-sm whitespace-nowrap">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="px-3 py-2.5 opacity-90 hover:opacity-100 hover:bg-white/10 rounded-md">
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
