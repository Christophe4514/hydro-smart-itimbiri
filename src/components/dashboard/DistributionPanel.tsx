import { LEVEL_BAR_CLASS, LEVEL_LABEL, LEVEL_ORDER, LEVEL_TEXT_CLASS } from "@/lib/status";
import type { StationSummary } from "@/lib/types";

export function DistributionPanel({ stations }: { stations: StationSummary[] }) {
  const total = stations.length;
  const counts = LEVEL_ORDER.map((lvl) => ({
    level: lvl,
    count: stations.filter((s) => s.current.level === lvl).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="rounded-lg border border-bg-border bg-bg-card p-4">
      <div className="mb-3 text-xs font-semibold tracking-wide text-gray-500">DISTRIBUTION · {total} SOUS-BASSINS</div>
      <div className="space-y-2">
        {counts.map(({ level, count }) => (
          <div key={level} className="flex items-center gap-3">
            <span className={`w-20 text-[11px] font-semibold ${LEVEL_TEXT_CLASS[level]}`}>{LEVEL_LABEL[level].toUpperCase()}</span>
            <div className="h-4 flex-1 overflow-hidden rounded bg-white/5">
              <div
                className={`flex h-full items-center justify-end rounded px-1.5 text-[10px] font-semibold text-black/70 ${LEVEL_BAR_CLASS[level]}`}
                style={{ width: `${(count / max) * 100}%`, minWidth: count > 0 ? "1.5rem" : 0 }}
              >
                {count > 0 && count}
              </div>
            </div>
            <span className="w-10 text-right text-[11px] text-gray-500">{total ? Math.round((count / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
