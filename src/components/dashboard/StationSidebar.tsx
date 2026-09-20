"use client";

import { useMemo, useState } from "react";
import { LEVEL_ORDER, LEVEL_TEXT_CLASS } from "@/lib/status";
import type { Level, StationSummary } from "@/lib/types";
import { StationCard } from "./StationCard";

export function StationSidebar({
  stations,
  selectedId,
  onSelect,
}: {
  stations: StationSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState<Level | null>(null);

  const counts = useMemo(() => {
    const c: Record<Level, number> = { critique: 0, alerte: 0, vigilance: 0, normal: 0, faible: 0 };
    for (const s of stations) c[s.current.level]++;
    return c;
  }, [stations]);

  const filtered = filter ? stations.filter((s) => s.current.level === filter) : stations;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="text-xs font-semibold tracking-wide text-gray-500">SOUS-BASSINS</span>
        <div className="flex gap-1">
          {LEVEL_ORDER.filter((l) => l !== "faible").map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(filter === lvl ? null : lvl)}
              className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${LEVEL_TEXT_CLASS[lvl]} ${
                filter === lvl ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5"
              }`}
            >
              {counts[lvl]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {filtered.map((s) => (
          <StationCard key={s.id} station={s} selected={s.id === selectedId} onSelect={() => onSelect(s.id)} />
        ))}
      </div>
    </div>
  );
}
