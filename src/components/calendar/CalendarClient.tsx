"use client";

import { useEffect, useMemo, useState } from "react";
import { LEVEL_ORDER, MONTH_LABELS_FULL } from "@/lib/status";
import type { AlertEvent, Level, MonthCell, StationSummary } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";

const LEVEL_BG: Record<Level, string> = {
  critique: "bg-red-500/20 border-red-500/40",
  alerte: "bg-orange-500/15 border-orange-500/30",
  vigilance: "bg-yellow-500/15 border-yellow-500/30",
  normal: "bg-blue-500/10 border-blue-500/20",
  faible: "bg-green-500/10 border-green-500/20",
};

function dominantLevel(counts: Record<Level, number>): Level | null {
  for (const lvl of LEVEL_ORDER) {
    if (lvl === "faible") continue;
    if (counts[lvl] > 0) return lvl;
  }
  return counts.faible > 0 ? "faible" : null;
}

export function CalendarClient({ stations, initialYear, initialMonth }: { stations: StationSummary[]; initialYear: number; initialMonth: number }) {
  const [year, setYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [stationFilter, setStationFilter] = useState<string>("all");
  const [grid, setGrid] = useState<MonthCell[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    fetch(`/api/calendar?year=${year}`)
      .then((r) => r.json())
      .then((d) => setGrid(d.grid));
  }, [year]);

  useEffect(() => {
    setLoadingEvents(true);
    fetch(`/api/events?year=${year}&month=${selectedMonth}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events))
      .finally(() => setLoadingEvents(false));
  }, [year, selectedMonth]);

  const filteredEvents = useMemo(
    () => (stationFilter === "all" ? events : events.filter((e) => e.stationId === stationFilter)),
    [events, stationFilter]
  );

  const totalYearEvents = grid.reduce((a, c) => a + c.eventCount, 0);
  const maxActivity = Math.max(...grid.map((c) => c.eventCount), 1);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setYear((y) => y - 1)} className="rounded px-2 py-1 text-gray-400 hover:bg-white/5">
              ‹
            </button>
            <h1 className="text-lg font-bold text-gray-100">{year}</h1>
            <button onClick={() => setYear((y) => y + 1)} className="rounded px-2 py-1 text-gray-400 hover:bg-white/5">
              ›
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              <span className="font-bold text-gray-100">{totalYearEvents}</span> événements
            </span>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="rounded border border-bg-border bg-bg-card px-2 py-1.5 text-xs text-gray-300"
            >
              <option value="all">Tous les sous-bassins</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {grid.map((cell) => {
            const lvl = dominantLevel(cell.counts);
            return (
              <button
                key={cell.month}
                onClick={() => setSelectedMonth(cell.month)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  cell.month === selectedMonth ? "ring-2 ring-blue-500" : ""
                } ${lvl ? LEVEL_BG[lvl] : "border-bg-border bg-bg-card"}`}
              >
                <div className="text-sm font-semibold text-gray-100">{MONTH_LABELS_FULL[cell.month - 1]}</div>
                <div className="mt-1 text-[11px] text-gray-400">{cell.eventCount} changement(s) de statut</div>
                <div className="mt-1 text-[11px] text-gray-500">{cell.total} stations couvertes</div>
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-bg-border bg-bg-card p-4">
          <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500">ACTIVITÉ DE L&apos;ANNÉE</div>
          <div className="flex h-16 items-end gap-1.5">
            {grid.map((cell) => (
              <div
                key={cell.month}
                className="flex h-full flex-1 flex-col justify-end"
                title={`${MONTH_LABELS_FULL[cell.month - 1]} : ${cell.eventCount}`}
              >
                <div
                  className={`w-full rounded-t ${cell.month === selectedMonth ? "bg-blue-500" : "bg-gray-600"}`}
                  style={{ height: `${Math.max(4, (cell.eventCount / maxActivity) * 100)}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-bg-border bg-bg-card">
        <div className="border-b border-bg-border px-4 py-3">
          <div className="text-xs font-semibold tracking-wide text-gray-500">
            {MONTH_LABELS_FULL[selectedMonth - 1].toUpperCase()} {year}
          </div>
          <div className="text-sm text-gray-300">{filteredEvents.length} événement(s)</div>
        </div>
        <div className="max-h-[70vh] space-y-2 overflow-y-auto p-3">
          {loadingEvents && <div className="p-4 text-center text-sm text-gray-500">Chargement…</div>}
          {!loadingEvents && filteredEvents.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">Aucun changement de statut ce mois-ci.</div>
          )}
          {filteredEvents.map((e, i) => (
            <div key={`${e.stationId}-${i}`} className="rounded-lg border border-bg-border/60 bg-bg-panel p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-100">{e.stationName}</span>
                <StatusBadge level={e.level} />
              </div>
              <div className="mt-1 text-[11px] text-gray-500">{e.stationId}</div>
              <div className="mt-1.5 text-xs text-gray-300">{e.message}</div>
              <div className="mt-1 text-[11px] text-gray-500">
                {e.source === "observe" ? `${e.dischargeM3s?.toFixed(1)} m³/s` : `${e.precipMm.toFixed(0)} mm de pluie`}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
