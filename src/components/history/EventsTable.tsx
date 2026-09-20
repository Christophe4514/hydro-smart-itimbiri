"use client";

import { useEffect, useState } from "react";
import { LEVEL_LABEL, LEVEL_ORDER, formatMonthYear } from "@/lib/status";
import type { AlertEvent, Level } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function EventsTable({ stationId, defaultTo }: { stationId: string; defaultTo?: string }) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<Level | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(defaultTo ?? "");
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => setPage(1), [stationId, q, level, from, to]);
  useEffect(() => setTo(defaultTo ?? ""), [stationId, defaultTo]);

  useEffect(() => {
    const params = new URLSearchParams({ stationId, page: String(page), pageSize: String(pageSize) });
    if (q) params.set("q", q);
    if (level) params.set("level", level);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    fetch(`/api/events?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events ?? []);
        setTotal(d.total ?? 0);
      });
  }, [stationId, q, level, from, to, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="rounded-lg border border-bg-border bg-bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-bg-border p-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher..."
          className="min-w-[160px] flex-1 rounded border border-bg-border bg-bg-panel px-2 py-1.5 text-xs text-gray-200 placeholder:text-gray-600"
        />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as Level | "")}
          className="rounded border border-bg-border bg-bg-panel px-2 py-1.5 text-xs text-gray-300"
        >
          <option value="">Tous niveaux</option>
          {LEVEL_ORDER.map((l) => (
            <option key={l} value={l}>
              {LEVEL_LABEL[l]}
            </option>
          ))}
        </select>
        <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded border border-bg-border bg-bg-panel px-2 py-1.5 text-xs text-gray-300" />
        <span className="text-gray-600">→</span>
        <input type="month" value={to} onChange={(e) => setTo(e.target.value)} className="rounded border border-bg-border bg-bg-panel px-2 py-1.5 text-xs text-gray-300" />
        <span className="ml-auto text-[11px] text-gray-500">{total} résultats</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-gray-500">
              <th className="px-4 py-2 font-medium">DATE</th>
              <th className="px-2 py-2 font-medium">NIVEAU</th>
              <th className="px-2 py-2 font-medium">VALEUR</th>
              <th className="px-2 py-2 font-medium">MESSAGE</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={i} className="border-t border-bg-border/60">
                <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-gray-400">{formatMonthYear(e.year, e.month)}</td>
                <td className="px-2 py-2">
                  <StatusBadge level={e.level} />
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-gray-300">
                  {e.source === "observe" ? `${e.dischargeM3s?.toFixed(1)} m³/s` : `${e.precipMm.toFixed(0)} mm`}
                </td>
                <td className="px-2 py-2 text-gray-400">{e.message}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  Aucun événement pour ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-bg-border px-4 py-2 text-xs text-gray-400">
        <span>
          Page {page} / {totalPages}
        </span>
        <div className="flex gap-1">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded px-2 py-1 hover:bg-white/5 disabled:opacity-30">
            ‹
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded px-2 py-1 hover:bg-white/5 disabled:opacity-30">
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
