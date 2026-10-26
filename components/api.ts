export async function send(url: string, body?: unknown, method = "POST") {
  try {
    const res = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data: data as Record<string, any>, error: res.ok ? null : ((data as any).error ?? "Request failed") as string }; // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch {
    return { ok: false, data: {} as Record<string, any>, error: "Network error — check your connection." }; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}
