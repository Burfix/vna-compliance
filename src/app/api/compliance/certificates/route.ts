import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { getStoreCertificates } from "@/lib/compliance/queries";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "OFFICER", "EXECUTIVE", "TENANT"]);

    const { searchParams } = new URL(request.url);
    let storeId = searchParams.get("storeId");

    // Tenant users can only see their own store
    if (user.role === "TENANT") {
      if (!user.storeId) {
        return NextResponse.json(
          { error: "Tenant account not linked to a store" },
          { status: 400 }
        );
      }
      storeId = user.storeId;
    }

    if (!storeId) {
      return NextResponse.json({ error: "storeId is required" }, { status: 400 });
    }

    const data = await getStoreCertificates(storeId);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
