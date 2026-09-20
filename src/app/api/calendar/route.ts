import { NextResponse } from "next/server";
import { getYearGrid } from "@/lib/events";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  if (!year) return NextResponse.json({ error: "year requis" }, { status: 400 });
  return NextResponse.json({ grid: getYearGrid(year) });
}
