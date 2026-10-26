"use client";
import dynamic from "next/dynamic";
import type { Pin } from "./MapView";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="h-[420px] bg-slate-100 rounded-xl animate-pulse" /> });

export default function FaultsMap({ pins, height = 460 }: { pins: Pin[]; height?: number }) {
  return <MapView pins={pins} height={height} />;
}
