import { NextResponse } from "next/server";
import { getEventCountsByStation } from "@/lib/events";

export async function GET() {
  return NextResponse.json({ counts: getEventCountsByStation() });
}
