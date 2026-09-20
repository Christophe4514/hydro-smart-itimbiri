"use client";

import { useEffect, useState } from "react";
import type { StationSummary, StationTimeseries } from "@/lib/types";
import { LEVEL_ORDER } from "@/lib/status";
import { DistributionPanel } from "./DistributionPanel";
import { PriorityTable } from "./PriorityTable";
import { StatCards } from "./StatCards";
import { StationSidebar } from "./StationSidebar";
import { TimeseriesChart } from "./TimeseriesChart";

function defaultSelection(stations: StationSummary[]): string {
  for (const lvl of LEVEL_ORDER) {
    const found = stations.find((s) => s.current.level === lvl);
    if (found) return found.id;
  }
  return stations[0]?.id ?? "";
}

export function DashboardClient({ stations }: { stations: StationSummary[] }) {
  const [selectedId, setSelectedId] = useState<string>(() => defaultSelection(stations));
  const [timeseries, setTimeseries] = useState<StationTimeseries | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/stations/${selectedId}`)
      .then((r) => r.json())
      .then((data: StationTimeseries) => {
        if (!cancelled) setTimeseries(data);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selected = stations.find((s) => s.id === selectedId);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[320px_1fr]">
      <aside className="lg:h-[calc(100vh-160px)]">
        <StationSidebar stations={stations} selectedId={selectedId} onSelect={setSelectedId} />
      </aside>

      <section className="space-y-4">
        {selected && (
          <>
            <div className="flex items-baseline gap-3">
              <span className="text-xs tracking-wide text-gray-500">BASSIN SÉLECTIONNÉ</span>
              <h1 className="text-lg font-bold text-gray-100">
                {selected.id} <span className="font-normal text-gray-400">· {selected.name}</span>
              </h1>
              {selected.approx && <span className="text-[11px] text-amber-400">position indicative</span>}
            </div>

            <StatCards station={selected} />

            {loading || !timeseries ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-bg-border bg-bg-card text-sm text-gray-500">
                Chargement…
              </div>
            ) : (
              <TimeseriesChart
                monthly={timeseries.monthly}
                thresholds={selected.thresholds}
                hasDischarge={selected.hasDischarge}
                uptoYear={selected.current.year}
                uptoMonth={selected.current.month}
              />
            )}

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <DistributionPanel stations={stations} />
              <PriorityTable stations={stations} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
