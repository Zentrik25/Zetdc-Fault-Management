"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

export type Group = { title: string; links: [string, string, string][] };

// Pages that are exact matches (their sub-paths belong to other nav items).
const EXACT = new Set(["/", "/dashboard", "/admin"]);
const isActive = (pathname: string, href: string) => (EXACT.has(href) ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

export default function NavBar({
  user, unread, links, groups,
}: { user: { name: string; role: string } | null; unread: number; links: [string, string][]; groups: Group[] }) {
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
    <>
      <header className="bg-white/85 backdrop-blur-md text-ink border-b border-line sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
          {/* Hamburger: phones only */}
          <button
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpenAt(pathname)}
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-slate-100 active:bg-slate-200"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2 font-normal text-lg tracking-tight mr-auto lg:mr-0 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ZETDC logo" width={36} height={36} className="h-9 w-9 rounded-full" />
            ZETDC <span className="font-light text-muted hidden xl:inline">Fault Management</span>
          </Link>

          {/* Horizontal links: computers / tablets */}
          <nav className="hidden lg:flex flex-1 min-w-0 items-center gap-0.5 ml-3 overflow-x-auto no-scrollbar whitespace-nowrap" aria-label="Main">
            {links.map(([href, label]) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`px-3 py-2 rounded-md text-sm ${active ? "text-brand bg-brand/10" : "text-ink hover:bg-slate-100"}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {user ? (
            <>
              <Link href="/notifications" className="relative p-2 -m-1 text-lg shrink-0" title="Notifications" aria-label="Notifications">
                🔔
                {unread > 0 && (
                  <span className="absolute top-0 right-0 bg-ruby text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">{unread}</span>
                )}
              </Link>
              <span className="hidden xl:inline text-sm text-muted max-w-40 truncate">{user.name}</span>
              <span className="hidden lg:inline-flex shrink-0"><LogoutButton variant="bar" /></span>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm shrink-0">
              <Link href="/login" className="px-2 py-2 text-ink hover:text-brand">Log in</Link>
              <Link href="/register" className="btn !min-h-0 !py-2">Sign up</Link>
            </div>
          )}
        </div>
      </header>

      {/* Drawer (phones only). Outside <header>: backdrop-filter would otherwise trap position:fixed. */}
      <div className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div onClick={() => setOpenAt(null)} className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
        <aside
          role="dialog"
          aria-label="Menu"
          className={`absolute left-0 top-0 h-full w-[85%] max-w-xs bg-white text-ink shadow-lg flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="bg-brand-dark text-white p-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-12 w-12 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="font-normal text-lg leading-tight tracking-tight">ZETDC</div>
              <div className="text-xs opacity-80 truncate">{user ? `${user.name} · ${user.role}` : "Fault Management System"}</div>
            </div>
            <button aria-label="Close menu" onClick={() => setOpenAt(null)} className="p-2 rounded-md hover:bg-white/10 text-xl leading-none">✕</button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {groups.map((g) => (
              <div key={g.title}>
                <div className="px-3 pb-1 text-[11px] font-normal uppercase tracking-widest text-muted">{g.title}</div>
                {g.links.map(([href, label, icon]) => (
                  <Link
                    key={href + label}
                    href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-normal ${isActive(pathname, href) ? "bg-brand/10 text-brand" : "hover:bg-slate-50"}`}
                  >
                    <span className="w-6 text-center">{icon}</span> {label}
                    {href === "/notifications" && unread > 0 && <span className="ml-auto bg-ruby text-white text-xs rounded-full px-2 py-0.5">{unread}</span>}
                  </Link>
                ))}
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
    </>
  );
}
