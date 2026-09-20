import { LEVEL_ORDER } from "@/lib/status";
import type { StationSummary } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getTrend, TrendArrow } from "@/components/shared/TrendArrow";

export function PriorityTable({
  stations,
  selectedId,
  onSelect,
}: {
  stations: StationSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const sorted = [...stations].sort((a, b) => LEVEL_ORDER.indexOf(a.current.level) - LEVEL_ORDER.indexOf(b.current.level)).slice(0, 12);

  return (
    <div className="rounded-lg border border-bg-border bg-bg-card">
      <div className="border-b border-bg-border px-4 py-2.5 text-xs font-semibold tracking-wide text-gray-500">
        SOUS-BASSINS PRIORITAIRES
      </div>
      <div className="max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-gray-500">
              <th className="px-4 py-2 font-medium">CODE</th>
              <th className="px-2 py-2 font-medium">PLUIE/DÉBIT</th>
              <th className="px-2 py-2 font-medium">ANOMALIE</th>
              <th className="px-2 py-2 font-medium" />
              <th className="px-4 py-2 text-right font-medium">STATUT</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const isObserved = s.current.source === "observe" && s.current.dischargeM3s !== null;
              const value = isObserved ? s.current.dischargeM3s! : s.current.precipMm;
              const trend = getTrend(s.current.anomalyPct, 0, 8);
              return (
                <tr
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  className={`cursor-pointer border-t border-bg-border/60 hover:bg-white/5 ${
                    s.id === selectedId ? "bg-blue-500/5" : ""
                  }`}
                >
                  <td className="px-4 py-2 font-mono text-blue-400">{s.id}</td>
                  <td className="px-2 py-2 text-gray-300">{value.toFixed(1)}</td>
                  <td className="px-2 py-2 text-gray-400">
                    {(s.current.anomalyPct ?? 0) >= 0 ? "+" : ""}
                    {s.current.anomalyPct?.toFixed(0) ?? "–"}%
                  </td>
                  <td className="px-2 py-2">
                    <TrendArrow trend={trend} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <StatusBadge level={s.current.level} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
