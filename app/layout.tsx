import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "ZETDC Fault Management",
  description: "Report and track electricity faults across Zimbabwe.",
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
