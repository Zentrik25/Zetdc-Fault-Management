"use client";
import { useEffect, useRef } from "react";

/** Global search: plain GET form to /search (works without JS). Press "/" to focus. */
export default function SearchBar() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && t && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <form action="/search" method="get" role="search" className="flex w-full max-w-2xl gap-2">
      <div className="relative flex-1">
        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={ref}
          name="q"
          type="search"
          required
          minLength={2}
          maxLength={80}
          autoComplete="off"
          placeholder="Search faults, tickets, areas, users, pages…"
          aria-label="Search"
          className="input !pl-10 !py-2"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 text-[11px] text-muted lg:block">/</kbd>
      </div>
      <button className="btn !min-h-0 !py-2">Search</button>
    </form>
  );
}
