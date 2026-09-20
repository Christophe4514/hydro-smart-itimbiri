import { getMeta } from "@/lib/data";
import { Clock } from "./Clock";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { Logo } from "./Logo";
import { NavTabs } from "./NavTabs";
import { StatusCountsBar } from "./StatusCountsBar";

export function Header() {
  const meta = getMeta();
  return (
    <header className="sticky top-0 z-20 border-b border-bg-border bg-bg-panel/95 backdrop-blur">
      <DisclaimerBanner />
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="leading-tight">
            <div className="text-sm font-bold text-gray-100">HydroAlerte</div>
            <div className="text-[11px] tracking-wide text-gray-500">ITIMBIRI · RDC</div>
          </div>
        </div>
        <NavTabs />
        <div className="ml-auto flex items-center gap-4">
          <StatusCountsBar counts={meta.statusCounts} />
          <Clock />
        </div>
      </div>
    </header>
  );
}
