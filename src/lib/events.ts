import { getAllTimeseries, getStationTimeseries } from "./data";
import type { AlertEvent, Level, MonthCell, MonthlyEntry, Source, StationTimeseries } from "./types";

function messageFor(level: Level, source: Source, previousLevel: Level | null): string {
  if (level === "normal" && previousLevel && previousLevel !== "normal") {
    return source === "observe" ? "Retour à un débit normal" : "Retour à une pluviométrie normale";
  }
  const discharge: Record<Level, string> = {
    faible: "Débit minimal détecté — risque d'étiage",
    normal: "Débit dans les valeurs normales",
    vigilance: "Débit au-dessus du seuil de vigilance",
    alerte: "Niveau d'alerte atteint — évacuations préventives recommandées",
    critique: "Crue majeure — évacuations immédiates recommandées",
  };
  const rain: Record<Level, string> = {
    faible: "Pluviométrie très inférieure à la normale — risque d'étiage en aval",
    normal: "Pluviométrie dans les valeurs normales",
    vigilance: "Précipitations au-dessus du seuil de vigilance",
    alerte: "Précipitations élevées — seuil d'alerte dépassé",
    critique: "Précipitations extrêmes — risque de crue en aval",
  };
  return source === "observe" ? discharge[level] : rain[level];
}

function toEvent(ts: { id: string; name: string }, curr: MonthlyEntry, prev: MonthlyEntry): AlertEvent {
  return {
    stationId: ts.id,
    stationName: ts.name,
    year: curr.year,
    month: curr.month,
    level: curr.level,
    previousLevel: prev.level,
    precipMm: curr.precipMm,
    anomalyPct: curr.anomalyPct,
    dischargeM3s: curr.dischargeM3s,
    source: curr.source,
    message: messageFor(curr.level, curr.source, prev.level),
  };
}

export function deriveEventsForStation(ts: StationTimeseries): AlertEvent[] {
  const events: AlertEvent[] = [];
  let prev: MonthlyEntry | null = null;
  for (const m of ts.monthly) {
    if (prev && m.level !== prev.level) events.push(toEvent(ts, m, prev));
    prev = m;
  }
  return events;
}

export function getEventsForStation(id: string): AlertEvent[] {
  const ts = getStationTimeseries(id);
  if (!ts) return [];
  return deriveEventsForStation(ts).sort((a, b) => b.year - a.year || b.month - a.month);
}

export function getEventsForMonth(year: number, month: number): AlertEvent[] {
  const events: AlertEvent[] = [];
  for (const ts of getAllTimeseries()) {
    const idx = ts.monthly.findIndex((m) => m.year === year && m.month === month);
    if (idx <= 0) continue;
    const curr = ts.monthly[idx];
    const prev = ts.monthly[idx - 1];
    if (curr.level !== prev.level) events.push(toEvent(ts, curr, prev));
  }
  return events.sort((a, b) => a.stationId.localeCompare(b.stationId));
}

export function getYearGrid(year: number): MonthCell[] {
  const all = getAllTimeseries();
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const counts: Record<Level, number> = { critique: 0, alerte: 0, vigilance: 0, normal: 0, faible: 0 };
    let total = 0;
    let eventCount = 0;
    for (const ts of all) {
      const idx = ts.monthly.findIndex((m) => m.year === year && m.month === month);
      if (idx === -1) continue;
      counts[ts.monthly[idx].level]++;
      total++;
      if (idx > 0 && ts.monthly[idx].level !== ts.monthly[idx - 1].level) eventCount++;
    }
    return { year, month, counts, total, eventCount };
  });
}

export function getYearlyEventCounts(id: string): Array<{ year: number; count: number }> {
  const events = getEventsForStation(id);
  const byYear = new Map<number, number>();
  for (const e of events) byYear.set(e.year, (byYear.get(e.year) ?? 0) + 1);
  return [...byYear.entries()].sort((a, b) => a[0] - b[0]).map(([year, count]) => ({ year, count }));
}

export function getEventCountsByStation(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ts of getAllTimeseries()) counts[ts.id] = deriveEventsForStation(ts).length;
  return counts;
}
