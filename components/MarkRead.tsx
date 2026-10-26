"use client";
import { useRouter } from "next/navigation";
import { send } from "./api";

export default function MarkRead() {
  const router = useRouter();
  return (
    <button
      className="btn btn-ghost"
      onClick={async () => {
        await send("/api/notifications");
        router.refresh();
      }}
    >
      Mark all as read
    </button>
  );
}
