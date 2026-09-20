import { NextResponse } from "next/server";
import { getEventsForMonth, getEventsForStation } from "@/lib/events";
import type { Level } from "@/lib/types";

function parseYm(v: string | null): { year: number; month: number } | null {
  if (!v) return null;
  const [y, m] = v.split("-").map(Number);
  if (!y || !m) return null;
  return { year: y, month: m };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  // Mode calendrier : toutes les stations, un mois précis
  if (year && month) {
    return NextResponse.json({ events: getEventsForMonth(Number(year), Number(month)) });
  }

  const stationId = searchParams.get("stationId");
  if (!stationId) return NextResponse.json({ error: "stationId requis" }, { status: 400 });

  let events = getEventsForStation(stationId);

  const level = searchParams.get("level") as Level | null;
  if (level) events = events.filter((e) => e.level === level);

  const from = parseYm(searchParams.get("from"));
  if (from) events = events.filter((e) => e.year > from.year || (e.year === from.year && e.month >= from.month));

  const to = parseYm(searchParams.get("to"));
  if (to) events = events.filter((e) => e.year < to.year || (e.year === to.year && e.month <= to.month));

  const q = searchParams.get("q")?.toLowerCase().trim();
  if (q) events = events.filter((e) => e.message.toLowerCase().includes(q) || e.stationName.toLowerCase().includes(q));

  const total = events.length;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
  const start = (page - 1) * pageSize;
  const pageItems = events.slice(start, start + pageSize);

  return NextResponse.json({ events: pageItems, total, page, pageSize });
}
