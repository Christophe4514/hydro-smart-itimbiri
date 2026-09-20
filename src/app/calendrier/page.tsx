import { CalendarClient } from "@/components/calendar/CalendarClient";
import { getMeta, getStations } from "@/lib/data";

export default function CalendrierPage() {
  const stations = getStations();
  const meta = getMeta();
  return <CalendarClient stations={stations} initialYear={meta.referenceYear} initialMonth={meta.referenceMonth} />;
}
