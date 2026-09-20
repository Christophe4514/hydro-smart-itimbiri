import { NextResponse } from "next/server";
import { getYearlyEventCounts } from "@/lib/events";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const stationId = searchParams.get("stationId");
  if (!stationId) return NextResponse.json({ error: "stationId requis" }, { status: 400 });
  return NextResponse.json({ yearly: getYearlyEventCounts(stationId) });
}
