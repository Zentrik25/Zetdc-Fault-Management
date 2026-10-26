import { handler, requireApiUser } from "@/lib/http";
import { listFaults } from "@/lib/faults";
import { STATUS_LABEL, typeLabel } from "@/lib/constants";

const csv = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export const GET = handler(async () => {
  const user = await requireApiUser("admin");
  const rows = await listFaults(user, {}, 5000);
  const head = ["Ticket", "Type", "Priority", "Status", "City", "Suburb", "Address", "Customer", "Phone", "Technician", "Reported", "Resolved", "Rating"];
  const lines = rows.map((r) =>
    [
      r.ticket, typeLabel(r.type), r.priority, STATUS_LABEL[r.status], r.city, r.suburb, r.address,
      r.reporter_name, r.reporter_phone, r.tech_name, r.created_at.toISOString(), r.resolved_at?.toISOString(), r.rating,
    ].map(csv).join(","),
  );
  return new Response([head.map(csv).join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="zetdc-faults-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});
