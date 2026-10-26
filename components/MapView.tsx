"use client";
import { useEffect, useRef } from "react";
import type L from "leaflet";
import { DEFAULT_CENTER } from "@/lib/constants";

export type Pin = { lat: number; lng: number; color: string; label: string; href?: string };

/** Interactive Leaflet map. `onPick` makes it a location picker; `pins` shows markers. */
export default function MapView({
  pins = [],
  pick,
  onPick,
  height = 380,
  focus,
}: {
  pins?: Pin[];
  pick?: [number, number] | null;
  onPick?: (lat: number, lng: number) => void;
  height?: number;
  focus?: [number, number] | null;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const lib = useRef<typeof L | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    let dead = false;
    (async () => {
      const Lf = (await import("leaflet")).default;
      if (dead || !el.current || map.current) return;
      lib.current = Lf;
      const m = Lf.map(el.current).setView(DEFAULT_CENTER, 12);
      Lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(m);
      layer.current = Lf.layerGroup().addTo(m);
      if (onPickRef.current) m.on("click", (e) => onPickRef.current?.(e.latlng.lat, e.latlng.lng));
      map.current = m;
      draw();
    })();
    return () => {
      dead = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    const Lf = lib.current;
    const m = map.current;
    if (!Lf || !m || !layer.current) return;
    layer.current.clearLayers();
    const pts: [number, number][] = [];
    for (const p of pins) {
      const c = Lf.circleMarker([p.lat, p.lng], { radius: 9, color: "#fff", weight: 2, fillColor: p.color, fillOpacity: 0.95 });
      c.bindPopup(p.href ? `${p.label}<br><a href="${p.href}" style="color:#0b3b8c;font-weight:600">Open →</a>` : p.label);
      c.addTo(layer.current);
      pts.push([p.lat, p.lng]);
    }
    if (pick) {
      const icon = Lf.divIcon({
        html: '<div style="font-size:30px;line-height:30px;transform:translate(-50%,-100%)">📍</div>',
        className: "",
        iconSize: [0, 0],
      });
      Lf.marker(pick, { icon }).addTo(layer.current);
    }
    if (pick) m.setView(pick, Math.max(m.getZoom(), 15));
    else if (focus) m.setView(focus, 15);
    else if (pts.length) m.fitBounds(pts, { padding: [30, 30], maxZoom: 15 });
  }

  useEffect(draw, [pins, pick, focus]);

  return <div ref={el} style={{ height }} className="w-full border border-slate-200" />;
}
