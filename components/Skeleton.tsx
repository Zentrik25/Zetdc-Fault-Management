/** Skeleton placeholders shown by loading.tsx files while a page's data loads. */

export function Skel({ className = "" }: { className?: string }) {
  return <div data-skeleton className={`skeleton ${className}`} aria-hidden />;
}

/** Wrap a whole loading screen so screen readers announce it once. */
export function LoadingShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

export function HeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="space-y-2.5">
        <Skel className="h-8 w-56 sm:w-72" />
        <Skel className="h-4 w-64 sm:w-96 max-w-full" />
      </div>
      {action && <Skel className="h-10 w-36" />}
    </div>
  );
}

export function StatsSkeleton({ n = 4, cols = "grid-cols-2 lg:grid-cols-4" }: { n?: number; cols?: string }) {
  return (
    <div className={`grid gap-3 ${cols}`}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="card space-y-3">
          <Skel className="h-3 w-20" />
          <Skel className="h-8 w-14" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card flex items-center gap-3">
          <Skel className="h-10 w-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skel className="h-4 w-2/5" />
            <Skel className="h-3 w-3/5" />
            <Skel className="h-3 w-1/4" />
          </div>
          <div className="space-y-2">
            <Skel className="h-5 w-20" />
            <Skel className="h-5 w-14 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`card space-y-3 ${className}`}>
      <Skel className="h-5 w-40" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skel key={i} className={`h-3.5 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="card space-y-4">
      <Skel className="h-6 w-32" />
      <div className="grid sm:grid-cols-2 gap-3">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skel className="h-3.5 w-24" />
            <Skel className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Skel className="h-10 w-32" />
    </div>
  );
}

export function MapSkeleton({ height = 420 }: { height?: number }) {
  return (
    <div data-skeleton className="skeleton w-full !rounded-md grid place-items-center text-sm text-muted" style={{ height }} aria-hidden>
      <span className="opacity-70">🗺️ Loading map…</span>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="bg-slate-50 p-3"><Skel className="h-4 w-1/3" /></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-t border-line p-3">
          <Skel className="h-4 w-1/5" />
          <Skel className="h-4 w-1/4" />
          <Skel className="h-4 w-1/6 hidden sm:block" />
          <Skel className="h-4 w-16 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 space-y-4">
        <div className="card space-y-4">
          <div className="flex justify-between gap-3">
            <div className="space-y-2"><Skel className="h-3 w-24" /><Skel className="h-7 w-52" /></div>
            <Skel className="h-6 w-24" />
          </div>
          <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <Skel key={i} className="h-2 flex-1" />)}</div>
          <Skel className="h-4 w-full" />
          <Skel className="h-4 w-4/5" />
          <div className="grid sm:grid-cols-2 gap-2">{Array.from({ length: 4 }).map((_, i) => <Skel key={i} className="h-4 w-3/4" />)}</div>
        </div>
        <CardSkeleton lines={4} />
      </div>
      <div className="lg:col-span-2 space-y-4">
        <FormSkeleton fields={2} />
        <CardSkeleton lines={2} />
      </div>
    </div>
  );
}
