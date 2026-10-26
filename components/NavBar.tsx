"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

type Group = { title: string; links: [string, string, string][] };

export default function NavBar({ user, unread, groups }: { user: { name: string; role: string } | null; unread: number; groups: Group[] }) {
  const pathname = usePathname();
  // The drawer is "open" only for the page it was opened on, so navigating closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="bg-brand text-white shadow sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <button
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpenAt(pathname)}
          className="p-2 -ml-2 rounded-md hover:bg-white/10 active:bg-white/20"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ZETDC logo" width={36} height={36} className="h-9 w-9 rounded-full bg-white" />
          ZETDC <span className="font-normal opacity-80 hidden md:inline">Fault Management</span>
        </Link>
        {user ? (
          <>
            <Link href="/notifications" className="relative p-2 -m-1 text-lg" title="Notifications" aria-label="Notifications">
              🔔
              {unread > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">{unread}</span>
              )}
            </Link>
            <span className="hidden sm:inline text-sm opacity-90 max-w-48 truncate">{user.name}</span>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Link href="/login" className="px-2 py-2 hover:underline">Log in</Link>
            <Link href="/register" className="bg-accent text-brand-dark font-semibold rounded-md px-3 py-2">Sign up</Link>
          </div>
        )}
      </div>

      {/* Drawer */}
      <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div onClick={() => setOpenAt(null)} className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
        <aside
          role="dialog"
          aria-label="Menu"
          className={`absolute left-0 top-0 h-full w-[85%] max-w-xs bg-white text-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="bg-brand text-white p-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-12 w-12 rounded-full bg-white" />
            <div className="flex-1 min-w-0">
              <div className="font-bold leading-tight">ZETDC</div>
              <div className="text-xs opacity-80 truncate">{user ? `${user.name} · ${user.role}` : "Fault Management System"}</div>
            </div>
            <button aria-label="Close menu" onClick={() => setOpenAt(null)} className="p-2 rounded-md hover:bg-white/10 text-xl leading-none">✕</button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {groups.map((g) => (
              <div key={g.title}>
                <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">{g.title}</div>
                {g.links.map(([href, label, icon]) => {
                  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium ${active ? "bg-brand/10 text-brand" : "hover:bg-slate-100"}`}
                    >
                      <span className="w-6 text-center">{icon}</span> {label}
                      {href === "/notifications" && unread > 0 && <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unread}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t space-y-2">
            {user ? (
              <LogoutButton variant="drawer" />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" className="btn btn-ghost">Log in</Link>
                <Link href="/register" className="btn">Sign up</Link>
              </div>
            )}
            <p className="text-[11px] text-slate-500 text-center">Emergency? Stay away from fallen lines.</p>
          </div>
        </aside>
      </div>
    </header>
  );
}
