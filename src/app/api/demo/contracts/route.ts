import { NextResponse } from "next/server";

export async function POST() {
  // Demo contract is pre-defined; this endpoint is a no-op stub
  return NextResponse.json({ ok: true, id: "contract-currency-cache" });
}
