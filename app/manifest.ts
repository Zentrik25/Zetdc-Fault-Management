import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZETDC Fault Management",
    short_name: "ZETDC Faults",
    description: "Report and track electricity faults across Zimbabwe.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6fa",
    theme_color: "#0b3b8c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
