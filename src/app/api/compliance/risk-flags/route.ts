import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { getRiskFlags } from "@/lib/compliance/queries";

export async function GET() {
  try {
    await requireRole(["ADMIN", "OFFICER", "EXECUTIVE"]);
    const data = await getRiskFlags();
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
