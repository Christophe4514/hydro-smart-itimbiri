import { getMeta } from "@/lib/data";
import { formatMonthYear } from "@/lib/status";

export function Footer() {
  const meta = getMeta();
  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-bg-border px-4 py-2 text-[11px] text-gray-500 sm:px-6">
      <span>
        HydroAlerte Itimbiri v1.0 · Système d&apos;aide à la décision hydrologique · Bassin de l&apos;Itimbiri, RDC ·{" "}
        {meta.totalStations} sous-bassins
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
        Données historiques &amp; climatiques réelles · Référence {formatMonthYear(meta.referenceYear, meta.referenceMonth)}
      </span>
    </footer>
  );
}
