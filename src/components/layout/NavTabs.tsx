"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Tableau de bord" },
  { href: "/carte", label: "Carte du bassin" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/historique", label: "Historique" },
];

export function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-blue-500/15 text-blue-400" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
