"use client";
import { useRouter } from "next/navigation";
import { send } from "./api";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="border border-white/40 rounded-md px-3 py-2 text-sm hover:bg-white/10"
      onClick={async () => {
        await send("/api/auth/logout");
        router.push("/");
        router.refresh();
      }}
    >
      Log out
    </button>
  );
}
