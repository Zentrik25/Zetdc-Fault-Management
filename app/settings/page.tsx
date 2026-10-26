import { requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { fmtDateTime } from "@/lib/constants";
import { getSettings } from "@/lib/settings";
import { PasswordForm, ProfileForm, SystemForm } from "@/components/SettingsForms";

export default async function Page() {
  const u = await requirePage();
  const [row] = await query<{ created_at: Date }>("SELECT created_at FROM users WHERE id=$1", [u.id]);
  const settings = u.role === "admin" ? await getSettings() : null;
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-light">Settings</h1>
        <p className="text-sm text-muted mt-1">
          Signed in as <b className="font-medium text-ink capitalize">{u.role}</b> · member since {fmtDateTime(row.created_at)}
        </p>
      </div>
      <ProfileForm name={u.name} phone={u.phone} email={u.email} />
      <PasswordForm />
      {settings && <SystemForm sla={settings.sla} registrationOpen={settings.registrationOpen} />}
    </div>
  );
}
