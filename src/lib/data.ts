import fs from "node:fs";
import path from "node:path";
import type { Meta, StationSummary, StationTimeseries } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "processed");

let stationsCache: StationSummary[] | null = null;
let metaCache: Meta | null = null;
const timeseriesCache = new Map<string, StationTimeseries>();

export function getStations(): StationSummary[] {
  if (!stationsCache) {
    stationsCache = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "stations.json"), "utf8"));
  }
  return stationsCache as StationSummary[];
}

export function getStation(id: string): StationSummary | undefined {
  return getStations().find((s) => s.id === id);
}

export function getMeta(): Meta {
  if (!metaCache) {
    metaCache = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "meta.json"), "utf8"));
  }
  return metaCache as Meta;
}

export function getStationTimeseries(id: string): StationTimeseries | null {
  if (timeseriesCache.has(id)) return timeseriesCache.get(id) ?? null;
  const file = path.join(DATA_DIR, "timeseries", `${id}.json`);
  if (!fs.existsSync(file)) return null;
  const data: StationTimeseries = JSON.parse(fs.readFileSync(file, "utf8"));
  timeseriesCache.set(id, data);
  return data;
}

export function getAllTimeseries(): StationTimeseries[] {
  return getStations()
    .map((s) => getStationTimeseries(s.id))
    .filter((t): t is StationTimeseries => t !== null);
}
