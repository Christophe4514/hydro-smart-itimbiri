"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LEVEL_LABEL, LEVEL_ORDER, LEVEL_TEXT_CLASS } from "@/lib/status";
import type { StationSummary } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";

const BasinMap = dynamic(() => import("./BasinMap").then((m) => m.BasinMap), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-gray-500">Chargement de la carte…</div>,
});

export function MapClient({ stations }: { stations: StationSummary[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = LEVEL_ORDER.map((lvl) => ({ level: lvl, count: stations.filter((s) => s.current.level === lvl).length }));
  const sorted = [...stations].sort((a, b) => LEVEL_ORDER.indexOf(a.current.level) - LEVEL_ORDER.indexOf(b.current.level));

  return (
    <div className="relative flex h-[calc(100vh-120px)] flex-col lg:flex-row">
      <div className="relative flex-1">
        <BasinMap stations={stations} selectedId={selectedId} onSelect={setSelectedId} />

        <div className="pointer-events-none absolute left-3 top-3 z-[1000] rounded-lg border border-bg-border bg-bg-panel/95 p-3 text-xs shadow-lg">
          <div className="mb-2 font-semibold tracking-wide text-gray-400">NIVEAUX D&apos;ALERTE</div>
          <div className="space-y-1">
            {counts.map(({ level, count }) => (
              <div key={level} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${LEVEL_TEXT_CLASS[level]} bg-current`} />
                <span className="text-gray-300">{LEVEL_LABEL[level]}</span>
                <span className="ml-auto text-gray-500">({count})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 rounded-lg border border-bg-border bg-bg-panel/95 px-3 py-1.5 text-[11px] text-gray-400 shadow-lg">
          BASSIN ITIMBIRI · {stations.length} SOUS-BASSINS · NORD-RDC
        </div>
      </div>

      <aside className="w-full overflow-y-auto border-t border-bg-border bg-bg-panel lg:h-full lg:w-80 lg:border-l lg:border-t-0">
        <div className="sticky top-0 border-b border-bg-border bg-bg-panel px-4 py-2.5 text-xs font-semibold tracking-wide text-gray-500">
          {selectedId ? "STATION SÉLECTIONNÉE" : "CLIQUER UN POINT SUR LA CARTE"}
        </div>
        <ul>
          {sorted.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setSelectedId(s.id)}
                className={`flex w-full items-center justify-between gap-2 border-b border-bg-border/60 px-4 py-2.5 text-left text-sm hover:bg-white/5 ${
                  s.id === selectedId ? "bg-blue-500/10" : ""
                }`}
              >
                <span>
                  <span className="block text-gray-100">{s.name}</span>
                  <span className="block font-mono text-[11px] text-gray-500">
                    {s.id} · {s.current.precipMm.toFixed(0)} mm
                  </span>
                </span>
                <StatusBadge level={s.current.level} />
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
