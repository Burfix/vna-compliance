import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * GET /api/compliance/file?key=<fileKey>
 *
 * Validates auth, looks up certificate by fileKey, then redirects to the stored URL.
 * Only ADMIN, OFFICER, EXECUTIVE, and the owning TENANT can access.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { role?: string; storeId?: string };
  const key = request.nextUrl.searchParams.get("key");

  if (!key || key.trim() === "") {
    return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
  }

  // Look up the certificate to verify ownership
  const cert = await db.certificate.findFirst({
    where: { fileKey: key },
    select: { id: true, storeId: true, fileName: true, fileKey: true },
  });

  if (!cert) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Tenants can only access their own store's files
  if (user.role === "TENANT" && user.storeId !== cert.storeId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Roles that have no store restriction
  const allowedRoles = ["ADMIN", "OFFICER", "EXECUTIVE", "TENANT"];
  if (!user.role || !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // fileKey is the Vercel Blob URL — redirect directly
  return NextResponse.redirect(cert.fileKey as string);
}
