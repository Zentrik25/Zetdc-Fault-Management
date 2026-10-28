import { passwordRules } from "@/lib/password";

/** Live "what's still missing" list shown under a new-password field. */
export function PasswordChecklist({ value }: { value: string }) {
  const rules = passwordRules(value);
  return (
    <ul className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 text-xs" aria-live="polite">
      {rules.map((r) => (
        <li key={r.id} className={r.ok ? "text-green-700" : "text-slate-500"}>
          {r.ok ? "✓" : "○"} {r.label}
        </li>
      ))}
    </ul>
  );
}
