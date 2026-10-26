// Signing key for login cookies. Shared by lib/auth.ts and proxy.ts (uses Web Crypto so it
// works wherever the proxy runs). On Vercel set AUTH_SECRET; if it is missing we derive a
// key from DATABASE_URL (itself a secret) so a deployment still works safely.
export async function secretKey(): Promise<Uint8Array> {
  let s = process.env.AUTH_SECRET;
  if (!s && process.env.DATABASE_URL) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("zetdc:" + process.env.DATABASE_URL));
    s = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return new TextEncoder().encode(s ?? "dev-only-secret-change-me");
}
