import { LEVEL_ORDER, LEVEL_LABEL, LEVEL_TEXT_CLASS } from "@/lib/status";
import type { Level } from "@/lib/types";

export function StatusCountsBar({ counts }: { counts: Record<Level, number> }) {
  const highest = LEVEL_ORDER.find((lvl) => lvl !== "faible" && counts[lvl] > 0);
  return (
    <div className="hidden items-center gap-4 lg:flex">
      <div className="flex items-center gap-3 text-xs font-medium">
        {LEVEL_ORDER.filter((l) => l !== "faible").map((lvl) => (
          <span key={lvl} className="flex items-center gap-1 text-gray-400">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass(lvl)}`} />
            <span className={LEVEL_TEXT_CLASS[lvl]}>{counts[lvl]}</span>
            <span>{LEVEL_LABEL[lvl].toUpperCase()}</span>
          </span>
        ))}
      </div>
      {highest && (
        <span className="rounded bg-red-600 px-2.5 py-1 text-xs font-bold tracking-wide text-white">
          {LEVEL_LABEL[highest].toUpperCase()}
        </span>
      )}
    </div>
  );
}

function dotClass(level: Level) {
  switch (level) {
    case "critique":
      return "bg-red-500";
    case "alerte":
      return "bg-orange-500";
    case "vigilance":
      return "bg-yellow-500";
    default:
      return "bg-blue-500";
  }
}
