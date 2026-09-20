"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MONTH_LABELS } from "@/lib/status";
import type { ClimStats, MonthlyEntry } from "@/lib/types";

type Tab = "precip" | "anomaly" | "discharge";

function buildTabs(hasDischarge: boolean): Array<{ id: Tab; label: string }> {
  const tabs: Array<{ id: Tab; label: string }> = [{ id: "precip", label: "Pluie (mm)" }];
  if (hasDischarge) tabs.push({ id: "discharge", label: "Débit (m³/s)" });
  tabs.push({ id: "anomaly", label: "Anomalie pluie (%)" });
  return tabs;
}

export function TimeseriesChart({
  monthly,
  thresholds,
  hasDischarge,
  windowSize = 36,
  uptoYear,
  uptoMonth,
}: {
  monthly: MonthlyEntry[];
  thresholds: { precip: ClimStats | null; discharge: ClimStats | null };
  hasDischarge: boolean;
  windowSize?: number;
  /** Fin de la fenêtre affichée (par défaut : dernier mois du tableau, qui peut
   * être une projection lointaine) — passer la date "actuelle" de la station
   * pour ne pas afficher des données au-delà d'aujourd'hui. */
  uptoYear?: number;
  uptoMonth?: number;
}) {
  const tabs = buildTabs(hasDischarge);
  const [tab, setTab] = useState<Tab>("precip");

  const data = useMemo(() => {
    let endIdx = monthly.length - 1;
    if (uptoYear !== undefined && uptoMonth !== undefined) {
      const idx = monthly.findIndex((m) => m.year === uptoYear && m.month === uptoMonth);
      if (idx !== -1) endIdx = idx;
    }
    const slice = monthly.slice(Math.max(0, endIdx - windowSize + 1), endIdx + 1);
    return slice.map((m) => ({
      label: `${MONTH_LABELS[m.month - 1]} ${String(m.year).slice(2)}`,
      precip: m.precipMm,
      anomaly: m.anomalyPct,
      discharge: m.dischargeM3s,
      isProjection: m.isProjection,
    }));
  }, [monthly, windowSize]);

  const clim = tab === "discharge" ? thresholds.discharge : thresholds.precip;
  const dataKey = tab === "precip" ? "precip" : tab === "anomaly" ? "anomaly" : "discharge";
  const color = tab === "anomaly" ? "#a78bfa" : "#3b82f6";

  return (
    <div className="rounded-lg border border-bg-border bg-bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded px-2.5 py-1 text-xs font-medium ${
                tab === t.id ? "bg-blue-500/15 text-blue-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-gray-500">{windowSize} derniers mois</span>
      </div>

      {clim && tab !== "anomaly" && (
        <div className="mb-2 flex flex-wrap gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-yellow-400">
            <span className="h-0.5 w-3 bg-yellow-400" /> Vigilance {clim.p75.toFixed(0)}
          </span>
          <span className="flex items-center gap-1 text-orange-400">
            <span className="h-0.5 w-3 bg-orange-400" /> Alerte {clim.p90.toFixed(0)}
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="h-0.5 w-3 bg-red-400" /> Critique {clim.p97.toFixed(0)}
          </span>
        </div>
      )}

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} interval="preserveStartEnd" axisLine={{ stroke: "#1f2937" }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{ background: "#0f1522", border: "1px solid #1f2937", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#9ca3af" }}
            />
            {clim && tab !== "anomaly" && (
              <>
                <ReferenceLine y={clim.p75} stroke="#eab308" strokeDasharray="4 4" strokeOpacity={0.6} />
                <ReferenceLine y={clim.p90} stroke="#f97316" strokeDasharray="4 4" strokeOpacity={0.6} />
                <ReferenceLine y={clim.p97} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.6} />
              </>
            )}
            {tab === "anomaly" && <ReferenceLine y={0} stroke="#4b5563" />}
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#fillColor)" connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
