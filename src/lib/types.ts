export type Level = "critique" | "alerte" | "vigilance" | "normal" | "faible";
export type Source = "pluie" | "observe";

export interface ClimStats {
  mean: number;
  p10: number;
  p75: number;
  p90: number;
  p97: number;
  n: number;
}

export interface StationCurrent {
  year: number;
  month: number;
  level: Level;
  precipMm: number;
  anomalyPct: number | null;
  tempC: number | null;
  dischargeM3s: number | null;
  source: Source;
}

export interface StationSummary {
  id: string;
  code: string;
  name: string;
  lat: number;
  lon: number;
  approx: boolean;
  hasDischarge: boolean;
  current: StationCurrent;
  thresholds: {
    precip: ClimStats | null;
    discharge: ClimStats | null;
  };
}

export interface MonthlyEntry {
  year: number;
  month: number;
  precipMm: number;
  anomalyPct: number | null;
  tempC: number | null;
  dischargeM3s: number | null;
  isProjection: boolean;
  level: Level;
  source: Source;
}

export interface StationTimeseries {
  id: string;
  name: string;
  monthly: MonthlyEntry[];
  climatology: Array<{ month: number; precip: ClimStats | null; discharge: ClimStats | null }>;
}

export interface Meta {
  generatedAt: string;
  referenceYear: number;
  referenceMonth: number;
  totalStations: number;
  statusCounts: Record<Level, number>;
  levels: Level[];
}

export interface MonthCell {
  year: number;
  month: number;
  counts: Record<Level, number>;
  total: number;
  eventCount: number;
}

export interface AlertEvent {
  stationId: string;
  stationName: string;
  year: number;
  month: number;
  level: Level;
  previousLevel: Level;
  precipMm: number;
  anomalyPct: number | null;
  dischargeM3s: number | null;
  source: Source;
  message: string;
}
