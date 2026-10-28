// Shared by the API routes (enforcement) and the forms (live checklist), so it must stay client-safe.

export const PASSWORD_MIN = 10;
// bcrypt ignores everything after 72 bytes, so longer input would be silently truncated.
export const PASSWORD_MAX = 72;

export type PasswordRule = { id: string; label: string; ok: boolean };

const COMMON = new Set([
  "password", "passw0rd", "p@ssw0rd", "p@ssword", "qwerty", "qwertyuiop", "letmein", "welcome",
  "admin", "administrator", "iloveyou", "monkey", "dragon", "football", "abc123", "zetdc", "zimbabwe",
  "changeme", "secret", "login", "master", "hello", "freedom",
]);

/** Lower-case and undo common look-alike substitutions so "P@ssw0rd!" is caught as "password". */
function normalise(pw: string) {
  return pw
    .toLowerCase()
    .replace(/@/g, "a")
    .replace(/[0]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[$5]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z]/g, "");
}

function isWeakPattern(pw: string) {
  if (/(.)\1{3,}/.test(pw)) return true; // 4+ identical characters in a row, e.g. "aaaa"
  const letters = pw.toLowerCase().replace(/[^a-z0-9]/g, "");
  const seq = "abcdefghijklmnopqrstuvwxyz0123456789";
  const rev = [...seq].reverse().join("");
  // Contains a run of 5 sequential characters such as "abcde" or "56789".
  for (let i = 0; i + 5 <= letters.length; i++) {
    const chunk = letters.slice(i, i + 5);
    if (seq.includes(chunk) || rev.includes(chunk)) return true;
  }
  return false;
}

export function passwordRules(pw: string): PasswordRule[] {
  return [
    { id: "length", label: `At least ${PASSWORD_MIN} characters`, ok: pw.length >= PASSWORD_MIN },
    { id: "lower", label: "A lowercase letter (a-z)", ok: /[a-z]/.test(pw) },
    { id: "upper", label: "An uppercase letter (A-Z)", ok: /[A-Z]/.test(pw) },
    { id: "digit", label: "A number (0-9)", ok: /\d/.test(pw) },
    { id: "symbol", label: "A symbol (e.g. ! @ # $ %)", ok: /[^A-Za-z0-9\s]/.test(pw) },
  ];
}

/**
 * Returns a user-facing message for the first problem found, or null if the password is strong.
 * `personal` is anything the password should not contain (email, name).
 */
export function passwordProblem(pw: string, personal: (string | null | undefined)[] = []): string | null {
  if (pw.length > PASSWORD_MAX) return `Password must be at most ${PASSWORD_MAX} characters.`;
  if (/\s/.test(pw)) return "Password cannot contain spaces.";
  const missing = passwordRules(pw).find((r) => !r.ok);
  if (missing) return `Password is too weak. It needs: ${missing.label.charAt(0).toLowerCase()}${missing.label.slice(1)}.`;
  const plain = normalise(pw);
  if ([...COMMON].some((c) => plain === c || (c.length >= 6 && plain.includes(c))))
    return "That password is too common. Choose something less predictable.";
  if (isWeakPattern(pw)) return "Avoid repeated or sequential characters such as 'aaaa' or '12345'.";
  const lower = pw.toLowerCase();
  for (const raw of personal) {
    const parts = (raw ?? "").toLowerCase().split(/[@.\s_-]+/).filter((p) => p.length >= 4);
    if (parts.some((p) => lower.includes(p))) return "Password must not contain your name or email.";
  }
  return null;
}
