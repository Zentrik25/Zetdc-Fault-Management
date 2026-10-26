import { requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { fmtDateTime } from "@/lib/constants";
import { NewUserForm, ToggleActive } from "@/components/UserAdmin";

type U = { id: number; name: string; email: string; phone: string | null; role: string; active: boolean; created_at: Date; faults: number };

export default async function Page() {
  const me = await requirePage("admin");
  const users = await query<U>(
    `SELECT u.id,u.name,u.email,u.phone,u.role,u.active,u.created_at,
       (SELECT count(*)::int FROM faults f WHERE f.user_id=u.id OR f.assigned_to=u.id) AS faults
     FROM users u ORDER BY (u.role='customer'), u.role, u.created_at DESC LIMIT 500`,
  );
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <NewUserForm />
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr><th className="p-3">Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Faults</th><th>Joined</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={`border-t ${u.active ? "" : "opacity-50"}`}>
                <td className="p-3 font-medium">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone ?? "—"}</td>
                <td className="capitalize">{u.role}</td>
                <td>{u.faults}</td>
                <td>{fmtDateTime(u.created_at)}</td>
                <td className="pr-3"><ToggleActive id={u.id} active={u.active} self={u.id === me.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
