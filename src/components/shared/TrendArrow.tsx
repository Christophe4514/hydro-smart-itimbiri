export type Trend = "up" | "down" | "stable";

export function getTrend(curr: number | null, prev: number | null, thresholdPct = 5): Trend {
  if (curr === null || prev === null || prev === 0) return "stable";
  const changePct = ((curr - prev) / Math.abs(prev)) * 100;
  if (changePct > thresholdPct) return "up";
  if (changePct < -thresholdPct) return "down";
  return "stable";
}

export function TrendArrow({ trend, className = "" }: { trend: Trend; className?: string }) {
  const glyph = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const color = trend === "up" ? "text-red-400" : trend === "down" ? "text-sky-400" : "text-gray-500";
  return <span className={`${color} ${className}`}>{glyph}</span>;
}
