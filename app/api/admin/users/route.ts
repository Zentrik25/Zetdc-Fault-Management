import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/db";
import { body, handler, HttpError, ok, requireApiUser, str } from "@/lib/http";

// Admin creates technicians / other admins.
export const POST = handler(async (req: Request) => {
  await requireApiUser("admin");
  const b = await body(req);
  const name = str(b.name, "Name", { min: 2, max: 80 })!;
  const email = str(b.email, "Email", { max: 120 })!.toLowerCase();
  const phone = str(b.phone, "Phone", { max: 20, optional: true });
  const role = b.role === "admin" ? "admin" : "technician";
  const password = typeof b.password === "string" ? b.password : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new HttpError(400, "Enter a valid email address.");
  if (password.length < 6) throw new HttpError(400, "Password must be at least 6 characters.");
  if (await queryOne("SELECT 1 FROM users WHERE email=$1", [email])) throw new HttpError(409, "Email already in use.");
  await query("INSERT INTO users (name,email,phone,password_hash,role) VALUES ($1,$2,$3,$4,$5)", [
    name,
    email,
    phone,
    await bcrypt.hash(password, 10),
    role,
  ]);
  return ok({ ok: true }, 201);
});
