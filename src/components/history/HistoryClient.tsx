"use client";

import { useEffect, useState } from "react";
import type { StationSummary, StationTimeseries } from "@/lib/types";
import { TimeseriesChart } from "@/components/dashboard/TimeseriesChart";
import { EventsTable } from "./EventsTable";
import { FrequencyChart } from "./FrequencyChart";
import { HistorySidebar } from "./HistorySidebar";

export function HistoryClient({ stations }: { stations: StationSummary[] }) {
  const [selectedId, setSelectedId] = useState(stations[0]?.id ?? "");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [timeseries, setTimeseries] = useState<StationTimeseries | null>(null);
  const [yearly, setYearly] = useState<Array<{ year: number; count: number }>>([]);

  useEffect(() => {
    fetch("/api/events/counts")
      .then((r) => r.json())
      .then((d) => setCounts(d.counts ?? {}));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/stations/${selectedId}`)
      .then((r) => r.json())
      .then(setTimeseries);
    fetch(`/api/events/yearly?stationId=${selectedId}`)
      .then((r) => r.json())
      .then((d) => setYearly(d.yearly ?? []));
  }, [selectedId]);

  const selected = stations.find((s) => s.id === selectedId);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-lg border border-bg-border bg-bg-card">
        <HistorySidebar stations={stations} counts={counts} selectedId={selectedId} onSelect={setSelectedId} />
      </aside>

      <section className="space-y-4">
        {selected && (
          <>
            <div>
              <span className="text-xs tracking-wide text-gray-500">{selected.id} · HISTORIQUE</span>
              <h1 className="text-lg font-bold text-gray-100">{selected.name}</h1>
            </div>

            {timeseries && (
              <TimeseriesChart
                monthly={timeseries.monthly}
                thresholds={selected.thresholds}
                hasDischarge={selected.hasDischarge}
                windowSize={240}
                uptoYear={selected.current.year}
                uptoMonth={selected.current.month}
              />
            )}

            <FrequencyChart yearly={yearly} />

            <EventsTable
              stationId={selectedId}
              defaultTo={`${selected.current.year}-${String(selected.current.month).padStart(2, "0")}`}
            />
          </>
        )}
      </section>
    </div>
  );
}
