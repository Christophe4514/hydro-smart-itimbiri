import { NextResponse } from "next/server";
import { getStationTimeseries } from "@/lib/data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ts = getStationTimeseries(id);
  if (!ts) return NextResponse.json({ error: "Station introuvable" }, { status: 404 });
  return NextResponse.json(ts);
}
