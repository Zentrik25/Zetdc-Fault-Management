import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "ZETDC Fault Management",
  description: "Report and track electricity faults across Zimbabwe.",
  appleWebApp: { capable: true, title: "ZETDC Faults", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f47c4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
