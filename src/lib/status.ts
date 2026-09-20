import type { Level } from "./types";

export const LEVEL_ORDER: Level[] = ["critique", "alerte", "vigilance", "normal", "faible"];

export const LEVEL_LABEL: Record<Level, string> = {
  critique: "Critique",
  alerte: "Alerte",
  vigilance: "Vigilance",
  normal: "Normal",
  faible: "Faible",
};

export const LEVEL_COLOR: Record<Level, string> = {
  critique: "#ef4444",
  alerte: "#f97316",
  vigilance: "#eab308",
  normal: "#3b82f6",
  faible: "#22c55e",
};

export const LEVEL_TEXT_CLASS: Record<Level, string> = {
  critique: "text-red-400",
  alerte: "text-orange-400",
  vigilance: "text-yellow-400",
  normal: "text-blue-400",
  faible: "text-green-400",
};

export const LEVEL_BADGE_CLASS: Record<Level, string> = {
  critique: "bg-red-500/15 text-red-400 border border-red-500/30",
  alerte: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  vigilance: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  normal: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  faible: "bg-green-500/15 text-green-400 border border-green-500/30",
};

export const LEVEL_BAR_CLASS: Record<Level, string> = {
  critique: "bg-red-500",
  alerte: "bg-orange-500",
  vigilance: "bg-yellow-500",
  normal: "bg-blue-500",
  faible: "bg-green-500",
};

export const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export const MONTH_LABELS_FULL = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_LABELS[month - 1]} ${year}`;
}
