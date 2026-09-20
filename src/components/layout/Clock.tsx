"use client";

import { useEffect, useState } from "react";

export function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  if (!now) return <div className="text-right text-xs text-gray-500">&nbsp;</div>;

  const time = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

  return (
    <div className="text-right leading-tight">
      <div className="text-sm font-semibold text-gray-200">{time}</div>
      <div className="text-[11px] text-gray-500">{date}</div>
    </div>
  );
}
