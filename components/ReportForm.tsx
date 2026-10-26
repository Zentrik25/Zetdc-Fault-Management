"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CITIES, FAULT_TYPES, typeLabel } from "@/lib/constants";
import { send } from "./api";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="h-[320px] bg-slate-100 rounded-xl animate-pulse" /> });

type Nearby = { id: number; ticket: string; type: string; status: string; address: string; suburb: string | null };

async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("Could not read that image."));
    i.src = url;
  });
  const max = 1000;
  const s = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * s);
  c.height = Math.round(img.height * s);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL("image/jpeg", 0.72);
}

export default function ReportForm() {
  const router = useRouter();
  const [type, setType] = useState("");
  const [danger, setDanger] = useState(false);
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Harare");
  const [suburb, setSuburb] = useState("");
  const [address, setAddress] = useState("");
  const [meter, setMeter] = useState("");
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [nearby, setNearby] = useState<Nearby[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [locMsg, setLocMsg] = useState("");

  useEffect(() => {
    if (!pos || !type) return;
    const t = setTimeout(async () => {
      const r = await fetch(`/api/faults/nearby?lat=${pos[0]}&lng=${pos[1]}&type=${type}`);
      if (r.ok) setNearby((await r.json()).faults);
    }, 300);
    return () => clearTimeout(t);
  }, [pos, type]);

  function locate() {
    if (!navigator.geolocation) return setLocMsg("Your browser does not support GPS. Tap the map instead.");
    setLocMsg("Finding you…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos([p.coords.latitude, p.coords.longitude]);
        setLocMsg("Location set from GPS. You can tap the map to adjust.");
      },
      () => setLocMsg("Could not get GPS. Tap the map to drop a pin instead."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function addPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - photos.length);
    try {
      const out = await Promise.all(files.map(shrink));
      setPhotos([...photos, ...out]);
    } catch (x) {
      setErr((x as Error).message);
    }
    e.target.value = "";
  }

  async function followExisting(id: number) {
    const r = await send(`/api/faults/${id}/metoo`);
    if (!r.ok) return setErr(r.error!);
    router.push(`/my-faults/${id}`);
    router.refresh();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!type) return setErr("Please choose the type of fault.");
    setBusy(true);
    const r = await send("/api/faults", {
      type, danger, description, city, suburb, address, meter_number: meter,
      lat: pos?.[0] ?? null, lng: pos?.[1] ?? null, photos,
    });
    if (!r.ok) {
      setErr(r.error!);
      setBusy(false);
      return;
    }
    router.push(`/my-faults/${r.data.id}?new=1`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Report a fault</h1>
        <p className="text-slate-600 text-sm">Tell us what is wrong and where. You will get a ticket number to track progress.</p>
      </div>

      <section className="card space-y-3">
        <h2 className="font-semibold">1. What is the problem?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FAULT_TYPES.map((t) => (
            <button
              type="button"
              key={t.value}
              onClick={() => setType(t.value)}
              className={`text-left rounded-lg border px-3 py-2 text-sm transition ${type === t.value ? "border-brand bg-brand/10 ring-2 ring-brand/30 font-semibold" : "border-slate-200 hover:bg-slate-50"}`}
            >
              <span className="mr-1">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <label className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm cursor-pointer">
          <input type="checkbox" className="mt-1" checked={danger} onChange={(e) => setDanger(e.target.checked)} />
          <span><b className="text-red-700">This is dangerous</b> — a live wire is down, there is fire/sparking, or someone could get hurt. (Keep everyone away from the area.)</span>
        </label>
        <div>
          <label className="label">Describe what you see</label>
          <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} placeholder="e.g. Transformer near the shops exploded at 7pm, whole street has no power." />
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">2. Where is it?</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">City / town</label>
            <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Suburb / area</label>
            <input className="input" value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="e.g. Mbare" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Street address or landmark</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="e.g. 12 Chitepo Rd, next to Total garage" />
          </div>
          <div>
            <label className="label">Meter number (optional)</label>
            <input className="input" value={meter} onChange={(e) => setMeter(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-ghost" onClick={locate}>📍 Use my current location</button>
          <span className="text-sm text-slate-600">{locMsg || "…or tap the map to drop a pin on the fault."}</span>
        </div>
        <MapView height={320} pick={pos} onPick={(lat, lng) => setPos([lat, lng])} />
        {pos && <p className="text-xs text-slate-500">Pin set at {pos[0].toFixed(5)}, {pos[1].toFixed(5)}</p>}
        {pos && type && nearby.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm space-y-2">
            <b>Already reported nearby ({typeLabel(type)}):</b>
            {nearby.map((n) => (
              <div key={n.id} className="flex flex-wrap items-center justify-between gap-2 bg-white rounded p-2 border">
                <span>{n.ticket} — {n.suburb ?? ""} {n.address}</span>
                <button type="button" className="btn text-xs" onClick={() => followExisting(n.id)}>Same problem — follow it</button>
              </div>
            ))}
            <p className="text-xs text-slate-600">Following an existing report helps us see how many people are affected. If yours is different, just continue below.</p>
          </div>
        )}
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">3. Photos (optional, up to 3)</h2>
        <input type="file" accept="image/*" multiple capture="environment" onChange={addPhotos} disabled={photos.length >= 3} className="text-sm" />
        <div className="flex gap-2 flex-wrap">
          {photos.map((p, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="h-24 w-24 object-cover rounded-lg border" />
              <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">✕</button>
            </div>
          ))}
        </div>
      </section>

      {err && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{err}</p>}
      <div className="flex gap-3">
        <button className="btn" disabled={busy}>{busy ? "Submitting…" : "Submit fault report"}</button>
        <Link href="/my-faults" className="btn btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}
