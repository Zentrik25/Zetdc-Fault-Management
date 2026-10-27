"use client";
import Link from "next/link";
import { useState } from "react";
import { send } from "./api";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await send(`/api/auth/${mode}`, f);
    if (!r.ok) {
      setErr(r.error!);
      setBusy(false);
      return;
    }
    // Full navigation: the browser may have cached a "redirect to /login" while prefetching
    // protected links as a signed-out visitor, so a client-side push could land back on /login.
    window.location.assign(r.data.role === "customer" ? "/dashboard" : "/admin");
  }

  return (
    <form onSubmit={submit} className="card max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-light">{mode === "login" ? "Log in" : "Create your account"}</h1>
      {mode === "register" && (
        <>
          <div>
            <label className="label">Full name</label>
            <input className="input" value={f.name} onChange={up("name")} required />
          </div>
          <div>
            <label className="label">Phone number (so the crew can reach you)</label>
            <input className="input" value={f.phone} onChange={up("phone")} placeholder="0772 123 456" />
          </div>
        </>
      )}
      <div>
        <label className="label">Email</label>
        <input className="input" type="email" value={f.email} onChange={up("email")} required autoComplete="email" />
      </div>
      <div>
        <label className="label">Password</label>
        <input
          className="input"
          type="password"
          value={f.password}
          onChange={up("password")}
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>
      {err && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{err}</p>}
      <button className="btn w-full" disabled={busy}>
        {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
      </button>
      <p className="text-sm text-center text-slate-600">
        {mode === "login" ? (
          <>No account? <Link className="text-brand font-semibold" href="/register">Sign up</Link></>
        ) : (
          <>Already registered? <Link className="text-brand font-semibold" href="/login">Log in</Link></>
        )}
      </p>
    </form>
  );
}
