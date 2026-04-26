import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { db } from "@/lib/db";
import { createAuditEvent } from "@/lib/compliance/audit-event";
import { ReviewDecision, DocumentStatus } from "@prisma/client";

/**
 * POST /api/compliance/review
 *
 * Body:
 *   certificateId  string
 *   decision       "APPROVED" | "REJECTED" | "REQUEST_RESUBMISSION"
 *   comment        string?
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "OFFICER"]);

    const body = await request.json();
    const { certificateId, decision, comment } = body;

    if (!certificateId || !decision) {
      return NextResponse.json(
        { error: "certificateId and decision are required" },
        { status: 400 }
      );
    }

    const validDecisions: ReviewDecision[] = [
      "APPROVED",
      "REJECTED",
      "REQUEST_RESUBMISSION",
    ];
    if (!validDecisions.includes(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    // Create the review record
    await db.certificateReview.create({
      data: {
        certificateId,
        reviewedById: user.id,
        decision,
        comment: comment ?? null,
      },
    });

    // Map decision → new certificate status
    const statusMap: Record<ReviewDecision, DocumentStatus> = {
      APPROVED: "APPROVED",
      REJECTED: "REJECTED",
      REQUEST_RESUBMISSION: "AWAITING_REVIEW",
    };

    const cert = await db.certificate.update({
      where: { id: certificateId },
      data: { status: statusMap[decision as ReviewDecision] },
      include: { store: { select: { id: true } } },
    });

    const eventTypeMap = {
      APPROVED: "DOCUMENT_APPROVED" as const,
      REJECTED: "DOCUMENT_REJECTED" as const,
      REQUEST_RESUBMISSION: "DOCUMENT_RESUBMISSION_REQUESTED" as const,
    };

    await createAuditEvent({
      eventType: eventTypeMap[decision as ReviewDecision],
      storeId: cert.store.id,
      certificateId: cert.id,
      actorId: user.id,
      actorName: user.name ?? user.username,
      details: { decision, comment },
    });

    return NextResponse.json({ data: { certificateId: cert.id, status: cert.status } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Review failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
