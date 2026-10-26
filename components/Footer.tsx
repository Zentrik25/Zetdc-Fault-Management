import Link from "next/link";

const cols: { title: string; links: [string, string][] }[] = [
  { title: "Customers", links: [["/report", "Report a fault"], ["/dashboard", "My dashboard"], ["/my-faults", "My faults"], ["/outages", "Outage map"], ["/load-shedding", "Load shedding"]] },
  { title: "Account", links: [["/login", "Log in"], ["/register", "Create an account"], ["/notifications", "Notifications"]] },
  { title: "Staff", links: [["/login", "Technician & control room login"]] },
];

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white mt-12 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-ruby via-[#ff8a3d] to-accent" />
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="ZETDC logo" width={48} height={48} className="h-12 w-12 rounded-full bg-white" />
              <div className="leading-tight">
                <div className="text-lg font-normal tracking-tight">ZETDC</div>
                <div className="text-xs text-white/60">Fault Management System</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-white/70 font-light max-w-xs leading-relaxed">
              Report electricity faults, follow repairs in real time and stay informed about outages and load shedding across Zimbabwe.
            </p>
            <p className="mt-4 text-xs text-white/50 max-w-xs">
              Zimbabwe Electricity Transmission &amp; Distribution Company. In an emergency, stay away from fallen lines and report immediately.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs uppercase tracking-widest text-white/50 mb-3">{c.title}</div>
              <ul className="space-y-2 text-sm">
                {c.links.map(([href, label]) => (
                  <li key={label}>
                    <Link href={href} className="text-white/80 hover:text-white hover:underline underline-offset-4">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-white/60">
          <div>© 2026 ZETDC Fault Management System. All rights reserved.</div>
          <div>
            Powered by <span className="text-white font-normal">Tafadzwa Samupindi</span> · 2026
          </div>
        </div>
      </div>
    </footer>
  );
}
