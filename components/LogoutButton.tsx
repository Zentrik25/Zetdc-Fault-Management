"use client";
import { useRouter } from "next/navigation";
import { send } from "./api";

export default function LogoutButton({ variant = "bar" }: { variant?: "bar" | "drawer" }) {
  const router = useRouter();
  return (
    <button
      className={variant === "drawer" ? "btn btn-ghost w-full" : "border border-white/40 rounded-md px-3 py-2 text-sm hover:bg-white/10"}
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
