import { body, handler, HttpError, ok, requireApiUser } from "@/lib/http";
import { PRIORITIES } from "@/lib/constants";
import { setSetting } from "@/lib/settings";

export const PATCH = handler(async (req: Request) => {
  await requireApiUser("admin");
  const b = await body(req);
  if (b.sla && typeof b.sla === "object") {
    for (const p of PRIORITIES) {
      const v = Number(b.sla[p]);
      if (!Number.isFinite(v) || v < 1 || v > 720) throw new HttpError(400, `Target hours for ${p} must be between 1 and 720.`);
      await setSetting(`sla_${p}`, String(Math.round(v)));
    }
  }
  if (typeof b.registration_open === "boolean") await setSetting("registration_open", String(b.registration_open));
  return ok();
});
