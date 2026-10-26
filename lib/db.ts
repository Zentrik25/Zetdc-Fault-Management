import "server-only";
import bcrypt from "bcryptjs";

// Postgres in production (DATABASE_URL, e.g. Neon / Vercel Postgres / Supabase).
// With no DATABASE_URL we fall back to an embedded Postgres (PGlite) stored in
// ./.data so the project runs locally with zero setup.

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

interface Driver {
  query(sql: string, params?: unknown[]): Promise<Row[]>;
  exec(sql: string): Promise<void>;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE SEQUENCE IF NOT EXISTS fault_ticket_seq START 1;
CREATE TABLE IF NOT EXISTS faults (
  id SERIAL PRIMARY KEY,
  ticket TEXT NOT NULL UNIQUE DEFAULT ('ZET-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('fault_ticket_seq')::text, 6, '0')),
  user_id INT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'reported',
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  suburb TEXT,
  city TEXT NOT NULL,
  meter_number TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  danger BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_to INT REFERENCES users(id),
  duplicate_of INT REFERENCES faults(id),
  resolution_note TEXT,
  rating INT,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS faults_user_idx ON faults(user_id);
CREATE INDEX IF NOT EXISTS faults_status_idx ON faults(status);
CREATE INDEX IF NOT EXISTS faults_assigned_idx ON faults(assigned_to);
CREATE TABLE IF NOT EXISTS fault_events (
  id SERIAL PRIMARY KEY,
  fault_id INT NOT NULL REFERENCES faults(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id),
  kind TEXT NOT NULL,
  internal BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fault_events_fault_idx ON fault_events(fault_id);
CREATE TABLE IF NOT EXISTS fault_photos (
  id SERIAL PRIMARY KEY,
  fault_id INT NOT NULL REFERENCES faults(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fault_photos_fault_idx ON fault_photos(fault_id);
CREATE TABLE IF NOT EXISTS fault_followers (
  fault_id INT NOT NULL REFERENCES faults(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (fault_id, user_id)
);
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  fault_id INT REFERENCES faults(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, read);
CREATE TABLE IF NOT EXISTS load_shedding (
  id SERIAL PRIMARY KEY,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  shed_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  stage INT,
  note TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS load_shedding_date_idx ON load_shedding(shed_date);
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  kind TEXT NOT NULL DEFAULT 'planned',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  area TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

async function createDriver(): Promise<Driver> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const local = /localhost|127\.0\.0\.1/.test(url);
    const pool = new Pool({
      connectionString: url,
      max: 3,
      ssl: local ? undefined : { rejectUnauthorized: false },
    });
    return {
      query: async (sql, params) => (await pool.query(sql, params as any[])).rows, // eslint-disable-line @typescript-eslint/no-explicit-any
      exec: async (sql) => {
        // Advisory lock so concurrent cold starts don't race while migrating.
        const client = await pool.connect();
        try {
          await client.query("SELECT pg_advisory_lock(727272)");
          await client.query(sql);
        } finally {
          await client.query("SELECT pg_advisory_unlock(727272)").catch(() => {});
          client.release();
        }
      },
    };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR ?? "./.data/pglite";
  const { mkdirSync } = await import("node:fs");
  mkdirSync(dir, { recursive: true });
  const pg = new PGlite(dir);
  await pg.waitReady;
  return {
    query: async (sql, params) => (await pg.query(sql, params as any[])).rows as Row[], // eslint-disable-line @typescript-eslint/no-explicit-any
    exec: async (sql) => {
      await pg.exec(sql);
    },
  };
}

async function init(): Promise<Driver> {
  const d = await createDriver();
  await d.exec(SCHEMA);
  const [{ n }] = await d.query("SELECT count(*)::int AS n FROM users");
  if (n === 0) {
    const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@zetdc.co.zw").toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD ?? "Admin@123";
    await d.query(
      "INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,'admin')",
      ["ZETDC Administrator", adminEmail, "0242000000", await bcrypt.hash(adminPass, 10)],
    );
    // A demo technician so the dispatch flow can be tried straight away.
    await d.query(
      "INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,'technician')",
      ["Tendai Moyo (Technician)", "tech@zetdc.co.zw", "0772000000", await bcrypt.hash("Tech@123", 10)],
    );
  }
  return d;
}

const g = globalThis as unknown as { __zetdcDb?: Promise<Driver> };

function driver(): Promise<Driver> {
  if (!g.__zetdcDb) {
    g.__zetdcDb = init().catch((e) => {
      g.__zetdcDb = undefined; // allow retry on next request
      throw e;
    });
  }
  return g.__zetdcDb;
}

export async function query<T = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await (await driver()).query(sql, params)) as T[];
}

export async function queryOne<T = Row>(sql: string, params: unknown[] = []): Promise<T | null> {
  return (await query<T>(sql, params))[0] ?? null;
}
