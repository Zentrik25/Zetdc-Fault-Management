import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "ZETDC Fault Management",
  description: "Report and track electricity faults across Zimbabwe.",
  appleWebApp: { capable: true, title: "ZETDC Faults", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b3b8c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="text-center text-xs text-slate-500 py-6">
          ZETDC Fault Management System — school project. Emergency? Stay away from fallen lines and call ZETDC.
        </footer>
      </body>
    </html>
  );
}
