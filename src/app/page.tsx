import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getStations } from "@/lib/data";

export default function DashboardPage() {
  const stations = getStations();
  return <DashboardClient stations={stations} />;
}
