import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { getComplianceSummary } from "@/lib/compliance/queries";

export async function GET() {
  try {
    await requireRole(["ADMIN", "OFFICER", "EXECUTIVE"]);
    const data = await getComplianceSummary();
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
