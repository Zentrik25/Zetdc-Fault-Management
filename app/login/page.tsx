import { redirect } from "next/navigation";
import { getUser, homeFor } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

export default async function Page() {
  const u = await getUser();
  if (u) redirect(homeFor(u.role));
  return <AuthForm mode="login" />;
}
