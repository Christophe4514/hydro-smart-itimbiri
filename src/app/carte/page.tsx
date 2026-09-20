import { MapClient } from "@/components/map/MapClient";
import { getStations } from "@/lib/data";

export default function CartePage() {
  const stations = getStations();
  return <MapClient stations={stations} />;
}
