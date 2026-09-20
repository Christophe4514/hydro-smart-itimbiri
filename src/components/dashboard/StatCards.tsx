import { formatMonthYear } from "@/lib/status";
import type { StationSummary } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";

function Card({ label, value, unit, hint }: { label: string; value: string; unit?: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-bg-border bg-bg-card p-3">
      <div className="text-[11px] tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-bold text-gray-100">{value}</span>
        {unit && <span className="text-xs text-gray-500">{unit}</span>}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-gray-500">{hint}</div>}
    </div>
  );
}

export function StatCards({ station }: { station: StationSummary }) {
  const { current } = station;
  const isObserved = current.source === "observe" && current.dischargeM3s !== null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {isObserved ? (
        <Card label="DÉBIT OBSERVÉ" value={current.dischargeM3s!.toFixed(1)} unit="m³/s" hint="Station Aketi" />
      ) : (
        <Card
          label="PLUIE DU MOIS"
          value={current.precipMm.toFixed(0)}
          unit="mm"
          hint={current.source === "pluie" ? "Projection climatique" : undefined}
        />
      )}
      <Card
        label="ANOMALIE VS NORMALE"
        value={`${(current.anomalyPct ?? 0) >= 0 ? "+" : ""}${current.anomalyPct?.toFixed(0) ?? "–"}`}
        unit="%"
        hint="Réf. climatologie 1935-2014"
      />
      <Card label="TEMPÉRATURE" value={current.tempC !== null ? current.tempC.toFixed(1) : "n/d"} unit={current.tempC !== null ? "°C" : undefined} />
      <Card label="DERNIÈRE DONNÉE" value={formatMonthYear(current.year, current.month)} hint={isObserved ? "Mesure réelle" : "Modélisé / projeté"} />
      <div className="rounded-lg border border-bg-border bg-bg-card p-3">
        <div className="text-[11px] tracking-wide text-gray-500">STATUT</div>
        <div className="mt-1.5">
          <StatusBadge level={current.level} />
        </div>
      </div>
    </div>
  );
}
