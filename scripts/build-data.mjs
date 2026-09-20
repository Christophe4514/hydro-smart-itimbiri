// Pipeline de préparation des données HydroAlerte Itimbiri.
// Lit les CSV bruts de basedesdonnes/, calcule la climatologie mensuelle,
// classe chaque mois selon un statut (Faible/Normal/Vigilance/Alerte/Critique)
// et écrit des JSON statiques consommés par l'application Next.js.
//
// Aucune donnée horaire/journalière n'est inventée : tout reste à la maille
// mensuelle des sources réelles (basedesdonnes/*.csv).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW_DIR = path.join(ROOT, "basedesdonnes");
const OUT_DIR = path.join(ROOT, "data", "processed");
const TS_DIR = path.join(OUT_DIR, "timeseries");

const REFERENCE_YEAR = 2026;
const REFERENCE_MONTH = 9; // aujourd'hui, selon l'horloge système au moment du build

const LEVELS = ["critique", "alerte", "vigilance", "normal", "faible"];

// ---------- utilitaires CSV ----------

// Lecture positionnelle (colonne 0/1/2), volontairement indépendante des noms
// d'en-tête : plusieurs fichiers sources ont des en-têtes malformés (ex.
// "year;;tas" ou "year;month;tas;" pour les stations 314/612) qui casseraient
// un accès par nom de colonne.
function readCsvPositional(filePath, delimiter) {
  if (!fs.existsSync(filePath)) return { header: [], rows: [] };
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => line.split(delimiter).map((v) => v.trim()));
  return { header, rows };
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function key(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

// ---------- statistiques ----------

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return null;
  const idx = (p / 100) * (sortedArr.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedArr[lo];
  return sortedArr[lo] + (sortedArr[hi] - sortedArr[lo]) * (idx - lo);
}

function computeClimatology(valuesByMonth) {
  // valuesByMonth: Map<month(1-12), number[]>
  const byMonth = {};
  for (let m = 1; m <= 12; m++) {
    const values = (valuesByMonth.get(m) || []).slice().sort((a, b) => a - b);
    if (values.length === 0) {
      byMonth[m] = null;
      continue;
    }
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    byMonth[m] = {
      mean,
      p10: percentile(values, 10),
      p75: percentile(values, 75),
      p90: percentile(values, 90),
      p97: percentile(values, 97),
      n: values.length,
    };
  }
  return byMonth;
}

function classify(value, clim) {
  if (!clim) return "normal";
  if (value >= clim.p97) return "critique";
  if (value >= clim.p90) return "alerte";
  if (value >= clim.p75) return "vigilance";
  if (value <= clim.p10) return "faible";
  return "normal";
}

function anomalyPct(value, clim) {
  if (!clim || !clim.mean) return null;
  return ((value - clim.mean) / clim.mean) * 100;
}

// ---------- lecture des sources ----------
//
// Le jeu de données brut contient plusieurs anomalies vérifiées manuellement
// (voir data/DATA_QUALITY.md) : fichier de projection corrompu (rampe
// artificielle) pour la station 1189, fichier constant (donnée factice) pour
// 1448, fichier de projection en réalité mal étiqueté (température au lieu
// de pluie) pour 613, et température exprimée en Kelvin au lieu de Celsius
// pour 612. Ces cas sont détectés et neutralisés ci-dessous plutôt que
// silencieusement propagés dans les statistiques.

function isPlausiblePrecipSeries(values) {
  if (values.length === 0) return false;
  const distinct = new Set(values.map((v) => Math.round(v * 100)));
  if (distinct.size <= 2) return false; // série constante/quasi constante -> donnée factice
  const max = Math.max(...values);
  if (max > 3000) return false; // aucun mois tropical ne dépasse ~1000mm ; marge large
  return true;
}

function loadPrecipHistorical(code) {
  const { header, rows } = readCsvPositional(path.join(RAW_DIR, `C_CB_${code}.csv`), ";");
  const map = new Map();
  if (!header.includes("pr")) return map;
  for (const [yearStr, monthStr, fluxStr] of rows) {
    const year = Number(yearStr);
    const month = Number(monthStr);
    const flux = Number(fluxStr); // kg/m^2/s
    if (Number.isNaN(flux) || Number.isNaN(year) || Number.isNaN(month)) continue;
    const mm = flux * 86400 * daysInMonth(year, month);
    map.set(key(year, month), mm);
  }
  return map;
}

function loadPrecipProjection(code) {
  const { header, rows } = readCsvPositional(path.join(RAW_DIR, `C_CB_${code}_1.csv`), ";");
  const map = new Map();
  if (!header.includes("pr")) return map; // ex. station 613 : fichier en réalité étiqueté "tas"
  for (const [yearStr, monthStr, mmStr] of rows) {
    const year = Number(yearStr);
    const month = Number(monthStr);
    const mm = Number(mmStr); // déjà en mm/mois
    if (Number.isNaN(mm) || Number.isNaN(year) || Number.isNaN(month)) continue;
    map.set(key(year, month), mm);
  }
  if (!isPlausiblePrecipSeries([...map.values()])) return new Map(); // ex. stations 1189, 1448
  return map;
}

function loadTempSeries(filePath) {
  const { header, rows } = readCsvPositional(filePath, ";");
  const map = new Map();
  if (!header.includes("tas")) return map;
  for (const [yearStr, monthStr, tasStr] of rows) {
    const year = Number(yearStr);
    const month = Number(monthStr);
    let celsius = Number(String(tasStr).replace(",", "."));
    if (Number.isNaN(celsius) || Number.isNaN(year) || Number.isNaN(month)) continue;
    if (celsius > 100) celsius -= 273.15; // ex. station 612 : valeurs en Kelvin
    map.set(key(year, month), celsius);
  }
  return map;
}

function loadTempHistorical(code) {
  const primary = loadTempSeries(path.join(RAW_DIR, `C_CB_${code}_3.csv`));
  if (primary.size > 0) return primary;
  // Repli : station 613 n'a pas de _3.csv, mais son _1.csv contient en réalité
  // des données de température (fichiers mal étiquetés à la source).
  return loadTempSeries(path.join(RAW_DIR, `C_CB_${code}_1.csv`));
}

function loadAketiDischarge() {
  const { header, rows } = readCsvPositional(path.join(RAW_DIR, "Aketi.csv"), ",");
  const map = new Map();
  if (header.length < 3) return map;
  for (const [yearStr, monthStr, dischargeStr] of rows) {
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (dischargeStr === undefined || dischargeStr === "" || Number.isNaN(Number(dischargeStr))) continue;
    if (Number.isNaN(year) || Number.isNaN(month)) continue;
    map.set(key(year, month), Number(dischargeStr));
  }
  return map;
}

// ---------- construction par station ----------

function buildStation(stationCfg) {
  const { id, code, name, hasDischarge } = stationCfg;

  const precipHist = loadPrecipHistorical(code);
  const precipProj = loadPrecipProjection(code);
  const tempHist = loadTempHistorical(code);
  const dischargeObs = hasDischarge ? loadAketiDischarge() : new Map();

  // Série mensuelle fusionnée (historique pluie + projection pluie), 1935-2099
  const allKeys = new Set([...precipHist.keys(), ...precipProj.keys()]);
  const sortedKeys = [...allKeys].sort();

  // Climatologie pluie : uniquement sur l'historique (1935-2014), par mois calendaire.
  // Chaque mois est comparé à la climatologie DU MÊME mois calendaire (ex. septembre
  // vs. la distribution des 80 septembres 1935-2014), ce qui gère la saisonnalité
  // sans qu'il soit nécessaire de lisser sur plusieurs mois (un lissage glissant
  // mélangerait des mois de saisons différentes et fausserait la comparaison).
  const precipByMonth = new Map();
  for (const k of sortedKeys) {
    if (!precipHist.has(k)) continue;
    const month = Number(k.slice(5, 7));
    if (!precipByMonth.has(month)) precipByMonth.set(month, []);
    precipByMonth.get(month).push(precipHist.get(k));
  }
  const precipClim = computeClimatology(precipByMonth);

  // Climatologie débit (Aketi uniquement), sur les mois observés 1951-1977
  let dischargeClim = null;
  if (hasDischarge) {
    const dByMonth = new Map();
    for (const [k, v] of dischargeObs) {
      const month = Number(k.slice(5, 7));
      if (!dByMonth.has(month)) dByMonth.set(month, []);
      dByMonth.get(month).push(v);
    }
    dischargeClim = computeClimatology(dByMonth);
  }

  const monthly = sortedKeys.map((k) => {
    const year = Number(k.slice(0, 4));
    const month = Number(k.slice(5, 7));
    const precipMm = precipHist.has(k) ? precipHist.get(k) : precipProj.get(k);
    const isProjection = !precipHist.has(k);
    const clim = precipClim[month];

    let level = classify(precipMm, clim);
    let source = "pluie";
    const dischargeM3s = dischargeObs.has(k) ? dischargeObs.get(k) : null;

    if (hasDischarge && dischargeM3s !== null && dischargeClim) {
      level = classify(dischargeM3s, dischargeClim[month]);
      source = "observe";
    }

    return {
      year,
      month,
      precipMm: Math.round(precipMm * 10) / 10,
      anomalyPct: anomalyPct(precipMm, clim) === null ? null : Math.round(anomalyPct(precipMm, clim) * 10) / 10,
      tempC: tempHist.has(k) ? Math.round(tempHist.get(k) * 10) / 10 : null,
      dischargeM3s,
      isProjection,
      level,
      source,
    };
  });

  const current =
    monthly.find((m) => m.year === REFERENCE_YEAR && m.month === REFERENCE_MONTH) ??
    monthly[monthly.length - 1];

  const climatology = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    return {
      month: m,
      precip: precipClim[m],
      discharge: dischargeClim ? dischargeClim[m] : null,
    };
  });

  return {
    summary: {
      id,
      code,
      name,
      lat: stationCfg.lat,
      lon: stationCfg.lon,
      approx: stationCfg.approx,
      hasDischarge,
      current: {
        year: current.year,
        month: current.month,
        level: current.level,
        precipMm: current.precipMm,
        anomalyPct: current.anomalyPct,
        tempC: current.tempC,
        dischargeM3s: current.dischargeM3s,
        source: current.source,
      },
      thresholds: {
        precip: precipClim[current.month],
        discharge: dischargeClim ? dischargeClim[current.month] : null,
      },
    },
    timeseries: { id, name, monthly, climatology },
  };
}

// ---------- exécution ----------
//
// Les événements (changements de statut) ne sont volontairement PAS précalculés
// ici : sur 165 ans x 32 stations cela représente des dizaines de milliers de
// lignes (plusieurs Mo), alors qu'ils se dérivent en quelques millisecondes à
// la lecture des séries mensuelles ci-dessous. Voir src/lib/events.ts, appelé
// côté serveur (API routes / server components) à la demande, filtré et paginé.

function main() {
  const configPath = path.join(ROOT, "data", "stations.config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  fs.mkdirSync(TS_DIR, { recursive: true });

  const stations = [];

  for (const stationCfg of config.stations) {
    const built = buildStation(stationCfg);
    stations.push(built.summary);
    fs.writeFileSync(
      path.join(TS_DIR, `${built.summary.id}.json`),
      JSON.stringify(built.timeseries)
    );
  }

  const counts = { critique: 0, alerte: 0, vigilance: 0, normal: 0, faible: 0 };
  for (const s of stations) counts[s.current.level]++;

  fs.writeFileSync(path.join(OUT_DIR, "stations.json"), JSON.stringify(stations, null, 2));
  fs.writeFileSync(
    path.join(OUT_DIR, "meta.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        referenceYear: REFERENCE_YEAR,
        referenceMonth: REFERENCE_MONTH,
        totalStations: stations.length,
        statusCounts: counts,
        levels: LEVELS,
      },
      null,
      2
    )
  );

  console.log(`OK — ${stations.length} stations.`);
  console.log("Répartition statut courant :", counts);
}

main();
