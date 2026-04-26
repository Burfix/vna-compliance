import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { db } from "@/lib/db";
import { createAuditEvent } from "@/lib/compliance/audit-event";

/**
 * POST /api/compliance/upload
 *
 * Body (JSON):
 *   storeId      string  — required (tenants: enforced to user.storeId)
 *   certificateId string — ID of existing certificate row to attach the upload to
 *   typeName     string  — required if creating a new certificate row
 *   fileKey      string  — storage key from upload provider (e.g. Vercel Blob)
 *   fileName     string
 *   fileSize     number
 *   referenceNo  string?
 *   issuedAt     string? — ISO date
 *   expiresAt    string? — ISO date
 *   notes        string?
 *
 * Returns: { data: { certificateId } }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "OFFICER", "TENANT"]);

    const body = await request.json();
    let { storeId } = body as { storeId: string | undefined };
    const { certificateId, typeName, fileKey, fileName, fileSize,
          referenceNo, issuedAt, expiresAt, notes } = body;

    // Tenants can only upload to their own store
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
    if (!fileKey || !fileName) {
      return NextResponse.json(
        { error: "fileKey and fileName are required" },
        { status: 400 }
      );
    }

    let cert;
    if (certificateId) {
      // Update existing certificate row
      cert = await db.certificate.update({
        where: { id: certificateId },
        data: {
          fileKey,
          fileName,
          fileSize: fileSize ?? null,
          referenceNo: referenceNo ?? null,
          issuedAt: issuedAt ? new Date(issuedAt) : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          notes: notes ?? null,
          status: "AWAITING_REVIEW",
          uploadedAt: new Date(),
        },
      });
    } else {
      // Create new certificate row
      if (!typeName) {
        return NextResponse.json({ error: "typeName is required" }, { status: 400 });
      }
      cert = await db.certificate.create({
        data: {
          storeId,
          typeName,
          fileKey,
          fileName,
          fileSize: fileSize ?? null,
          referenceNo: referenceNo ?? null,
          issuedAt: issuedAt ? new Date(issuedAt) : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          notes: notes ?? null,
          status: "AWAITING_REVIEW",
          uploadedAt: new Date(),
        },
      });
    }

    await createAuditEvent({
      eventType: "DOCUMENT_UPLOADED",
      storeId,
      certificateId: cert.id,
      actorId: user.id,
      actorName: user.name ?? user.username,
      details: { fileName, typeName: typeName ?? cert.typeName },
    });

    return NextResponse.json({ data: { certificateId: cert.id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
