"use client";
import { useRouter } from "next/navigation";
import { send } from "./api";

export default function LogoutButton({ variant = "bar" }: { variant?: "bar" | "drawer" | "sidebar" }) {
  const router = useRouter();
  return (
    <button
      className={
        variant === "sidebar"
          ? "flex w-full items-center justify-center gap-2 rounded-md bg-white/6 px-2 py-2 text-[13px] text-white/80 hover:bg-ruby/80 hover:text-white"
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
      {variant === "sidebar" && <span aria-hidden>↪️</span>}
      Log out
    </button>
  );
}
