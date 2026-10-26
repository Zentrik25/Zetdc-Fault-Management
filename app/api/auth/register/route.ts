import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { body, handler, HttpError, ok, str } from "@/lib/http";
import { getSettings } from "@/lib/settings";

export const POST = handler(async (req: Request) => {
  if (!(await getSettings()).registrationOpen) throw new HttpError(403, "New sign-ups are currently closed. Please contact ZETDC.");
  const b = await body(req);
  const name = str(b.name, "Name", { min: 2, max: 80 })!;
  const email = str(b.email, "Email", { max: 120 })!.toLowerCase();
  const phone = str(b.phone, "Phone number", { min: 7, max: 20, optional: true });
  const password = typeof b.password === "string" ? b.password : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new HttpError(400, "Enter a valid email address.");
  if (password.length < 6) throw new HttpError(400, "Password must be at least 6 characters.");
  if (await queryOne("SELECT 1 FROM users WHERE email=$1", [email]))
    throw new HttpError(409, "An account with that email already exists.");
  const [u] = await query<{ id: number }>(
    "INSERT INTO users (name,email,phone,password_hash,role) VALUES ($1,$2,$3,$4,'customer') RETURNING id",
    [name, email, phone, await bcrypt.hash(password, 10)],
  );
  await createSession(u.id);
  return ok({ ok: true, role: "customer" }, 201);
});
