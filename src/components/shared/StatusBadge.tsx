import { LEVEL_BADGE_CLASS, LEVEL_LABEL } from "@/lib/status";
import type { Level } from "@/lib/types";

export function StatusBadge({ level, className = "" }: { level: Level; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap ${LEVEL_BADGE_CLASS[level]} ${className}`}
    >
      {LEVEL_LABEL[level].toUpperCase()}
    </span>
  );
}
