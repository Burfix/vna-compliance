import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { getAuditTrail } from "@/lib/compliance/queries";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "OFFICER", "EXECUTIVE"]);

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);

    const data = await getAuditTrail(storeId, Math.min(limit, 500));
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
