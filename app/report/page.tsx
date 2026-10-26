import { requirePage } from "@/lib/auth";
import ReportForm from "@/components/ReportForm";

export default async function Page() {
  await requirePage("customer");
  return <ReportForm />;
}
