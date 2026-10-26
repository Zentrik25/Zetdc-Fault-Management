"use client";
import dynamic from "next/dynamic";
import type { Pin } from "./MapView";
import { MapSkeleton } from "./Skeleton";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <MapSkeleton height={420} /> });

export default function FaultsMap({ pins, height = 460 }: { pins: Pin[]; height?: number }) {
  return <MapView pins={pins} height={height} />;
}
