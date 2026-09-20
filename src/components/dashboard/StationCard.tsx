import { LEVEL_BAR_CLASS } from "@/lib/status";
import type { StationSummary } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getTrend, TrendArrow } from "@/components/shared/TrendArrow";

function clampPct(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

export function StationCard({
  station,
  selected,
  onSelect,
}: {
  station: StationSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  const { current, thresholds } = station;
  const usesDischarge = current.source === "observe" && current.dischargeM3s !== null;
  const primaryValue = usesDischarge ? current.dischargeM3s! : current.precipMm;
  const primaryUnit = usesDischarge ? "m³/s" : "mm";
  const clim = usesDischarge ? thresholds.discharge : thresholds.precip;
  const barPct = clim ? clampPct(primaryValue, clim.p10, clim.p97) : 0;
  const trend = getTrend(current.anomalyPct, 0, 8);

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        selected ? "border-blue-500/50 bg-blue-500/10" : "border-bg-border bg-bg-card hover:border-gray-600"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-gray-500">{station.id}</span>
        <StatusBadge level={current.level} />
      </div>
      <div className="mt-1 truncate text-sm font-semibold text-gray-100">{station.name}</div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-100">{primaryValue.toFixed(0)}</span>
        <span className="text-xs text-gray-500">{primaryUnit}</span>
        <TrendArrow trend={trend} className="ml-1 text-sm" />
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div className={`h-full rounded-full ${LEVEL_BAR_CLASS[current.level]}`} style={{ width: `${barPct}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-500">
        <span>
          {usesDischarge
            ? `${current.precipMm.toFixed(0)} mm pluie`
            : `${(current.anomalyPct ?? 0) >= 0 ? "+" : ""}${current.anomalyPct?.toFixed(0) ?? "–"}% vs normale`}
        </span>
      </div>
    </button>
  );
}
