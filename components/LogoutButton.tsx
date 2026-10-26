"use client";
import { useRouter } from "next/navigation";
import { send } from "./api";

export default function LogoutButton({ variant = "bar" }: { variant?: "bar" | "drawer" | "sidebar" }) {
  const router = useRouter();
  return (
    <button
      className={
        variant === "sidebar"
          ? "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[15px] text-white/75 hover:bg-white/8 hover:text-white"
          : variant === "drawer"
            ? "btn btn-ghost w-full"
            : "btn btn-ghost !min-h-0 !py-2 text-sm"
      }
      onClick={async () => {
        await send("/api/auth/logout");
        router.push("/");
        router.refresh();
      }}
    >
      {variant === "sidebar" && <span className="w-6 text-center text-base">↪️</span>}
      Log out
    </button>
  );
}
