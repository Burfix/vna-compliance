import { db } from "@/lib/db";
import { AuditEventType, Prisma } from "@prisma/client";

type CreateAuditEventInput = {
  eventType: AuditEventType;
  storeId?: string;
  certificateId?: string;
  actorId?: string;
  actorName?: string;
  details?: Record<string, unknown>;
};

/**
 * Write a compliance audit event. Call this after any meaningful state change.
 * Fire-and-forget safe — errors are logged but not rethrown.
 */
export async function createAuditEvent(input: CreateAuditEventInput): Promise<void> {
  try {
    await db.complianceAuditEvent.create({
      data: {
        eventType: input.eventType,
        storeId: input.storeId ?? null,
        certificateId: input.certificateId ?? null,
        actorId: input.actorId ?? null,
        actorName: input.actorName ?? null,
        details: input.details != null
          ? (input.details as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  } catch (err) {
    console.error("[createAuditEvent] Failed to write audit event:", err);
  }
}
