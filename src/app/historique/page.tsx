import { HistoryClient } from "@/components/history/HistoryClient";
import { getStations } from "@/lib/data";

export default function HistoriquePage() {
  const stations = getStations();
  return <HistoryClient stations={stations} />;
}
