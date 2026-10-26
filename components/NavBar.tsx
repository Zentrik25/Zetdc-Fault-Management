"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

export type Group = { title: string; links: [string, string, string][] };
type User = { name: string; role: string };

// Pages that are exact matches (their sub-paths belong to other nav items).
const EXACT = new Set(["/", "/dashboard", "/admin"]);
const isActive = (pathname: string, href: string) => (EXACT.has(href) ? pathname === href : pathname === href || pathname.startsWith(href + "/"));
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-normal text-lg tracking-tight shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="ZETDC logo" width={36} height={36} className="h-9 w-9 rounded-full" />
      ZETDC
    </Link>
  );
}

/** Dark indigo panel shared by the desktop sidebar and the phone drawer. */
function SidebarBody({ user, unread, groups, pathname, onClose }: { user: User; unread: number; groups: Group[]; pathname: string; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-brand-dark to-[#0a1848] text-white">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="ZETDC logo" className="h-11 w-11 rounded-full ring-2 ring-white/20" />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-lg font-normal tracking-tight">ZETDC</div>
          <div className="text-[11px] text-white/60">Fault Management</div>
        </div>
        {onClose && (
          <button aria-label="Close menu" onClick={onClose} className="p-2 -mr-2 rounded-md text-xl leading-none hover:bg-white/10">✕</button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5" aria-label="Main">
        {groups.map((g) => (
          <div key={g.title}>
            <div className="px-3 pb-1.5 text-[10px] uppercase tracking-[0.18em] text-white/45">{g.title}</div>
            <div className="space-y-0.5">
              {g.links.map(([href, label, icon]) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href + label}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] transition-colors ${active ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/8 hover:text-white"}`}
                  >
                    {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-accent" />}
                    <span className="w-6 text-center text-base">{icon}</span>
                    <span className="flex-1">{label}</span>
                    {href === "/notifications" && unread > 0 && <span className="bg-ruby text-white text-[11px] leading-none rounded-full px-2 py-1">{unread}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-1">
        <Link
          href="/settings"
          aria-current={isActive(pathname, "/settings") ? "page" : undefined}
          className={`relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] ${isActive(pathname, "/settings") ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/8 hover:text-white"}`}
        >
          {isActive(pathname, "/settings") && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-accent" />}
          <span className="w-6 text-center text-base">⚙️</span> Settings
        </Link>
        <LogoutButton variant="sidebar" />
        <div className="mt-2 flex items-center gap-3 rounded-lg bg-white/8 px-3 py-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ruby to-accent text-sm font-normal text-white">{initials(user.name)}</div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm">{user.name}</div>
            <div className="text-[11px] capitalize text-white/55">{user.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NavBar({ user, unread, links, groups }: { user: User | null; unread: number; links: [string, string][]; groups: Group[] }) {
  const pathname = usePathname();
  // The drawer is "open" only for the page it was opened on, so navigating closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const close = () => setOpenAt(null);

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

  const burger = (
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
  );

  const drawer = (content: React.ReactNode, side = "left") => (
    <div className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={close} className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        role="dialog"
        aria-label="Menu"
        className={`absolute ${side}-0 top-0 h-full w-[85%] max-w-xs shadow-lg transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {content}
      </aside>
    </div>
  );

  /* ---------- Logged in: left sidebar (computers) + top strip & drawer (phones) ---------- */
  if (user) {
    return (
      <>
        <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 shadow-lg" aria-label="Sidebar">
          <SidebarBody user={user} unread={unread} groups={groups} pathname={pathname} />
        </aside>

        <header className="lg:hidden bg-white/85 backdrop-blur-md text-ink border-b border-line sticky top-0 z-40">
          <div className="px-4 py-2.5 flex items-center gap-3">
            {burger}
            <div className="mr-auto"><Brand /></div>
            <Link href="/notifications" className="relative p-2 -m-1 text-lg" title="Notifications" aria-label="Notifications">
              🔔
              {unread > 0 && <span className="absolute top-0 right-0 bg-ruby text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">{unread}</span>}
            </Link>
          </div>
        </header>

        {drawer(<SidebarBody user={user} unread={unread} groups={groups} pathname={pathname} onClose={close} />)}
      </>
    );
  }

  /* ---------- Logged out: horizontal top bar (computers), hamburger drawer (phones) ---------- */
  return (
    <>
      <header className="bg-white/85 backdrop-blur-md text-ink border-b border-line sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
          {burger}
          <div className="mr-auto lg:mr-0"><Brand /></div>
          <nav className="hidden lg:flex flex-1 items-center gap-0.5 ml-3" aria-label="Main">
            {links.map(([href, label]) => {
              const active = isActive(pathname, href);
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`px-3 py-2 rounded-md text-sm ${active ? "text-brand bg-brand/10" : "text-ink hover:bg-slate-100"}`}>
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 text-sm shrink-0">
            <Link href="/login" className="px-2 py-2 text-ink hover:text-brand">Log in</Link>
            <Link href="/register" className="btn !min-h-0 !py-2">Sign up</Link>
          </div>
        </div>
      </header>

      {drawer(
        <div className="flex h-full flex-col bg-white text-ink">
          <div className="bg-brand-dark text-white p-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-12 w-12 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="font-normal text-lg leading-tight tracking-tight">ZETDC</div>
              <div className="text-xs opacity-80 truncate">Fault Management System</div>
            </div>
            <button aria-label="Close menu" onClick={close} className="p-2 rounded-md hover:bg-white/10 text-xl leading-none">✕</button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {groups.map((g) => (
              <div key={g.title}>
                <div className="px-3 pb-1 text-[11px] uppercase tracking-widest text-muted">{g.title}</div>
                {g.links.map(([href, label, icon]) => (
                  <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] ${isActive(pathname, href) ? "bg-brand/10 text-brand" : "hover:bg-slate-50"}`}>
                    <span className="w-6 text-center">{icon}</span> {label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t grid grid-cols-2 gap-2">
            <Link href="/login" className="btn btn-ghost">Log in</Link>
            <Link href="/register" className="btn">Sign up</Link>
          </div>
        </div>,
      )}
    </>
  );
}
