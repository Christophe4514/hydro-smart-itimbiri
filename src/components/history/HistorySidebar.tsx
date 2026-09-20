import type { StationSummary } from "@/lib/types";

export function HistorySidebar({
  stations,
  counts,
  selectedId,
  onSelect,
}: {
  stations: StationSummary[];
  counts: Record<string, number>;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
      {stations.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`flex w-full items-center justify-between gap-2 border-b border-bg-border/60 px-3 py-2.5 text-left text-sm hover:bg-white/5 ${
            s.id === selectedId ? "bg-blue-500/10" : ""
          }`}
        >
          <span>
            <span className="block text-gray-100">{s.id}</span>
            <span className="block text-[11px] text-gray-500">{s.name}</span>
          </span>
          <span className="text-xs font-semibold text-gray-400">{counts[s.id] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
