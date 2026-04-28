-- Migration: Add certificates schema
-- Adds missing enums, columns, and tables that were added to schema.prisma
-- but never migrated to production.

-- ── Enum additions ────────────────────────────────────────────────────────────

-- Add EXECUTIVE and TENANT to existing Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EXECUTIVE';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'TENANT';

-- New enums
DO $$ BEGIN
  CREATE TYPE "DocumentStatus" AS ENUM (
    'MISSING',
    'AWAITING_REVIEW',
    'APPROVED',
    'REJECTED',
    'EXPIRED',
    'EXPIRING_SOON'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReviewDecision" AS ENUM (
    'APPROVED',
    'REJECTED',
    'REQUEST_RESUBMISSION'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AuditEventType" AS ENUM (
    'DOCUMENT_UPLOADED',
    'DOCUMENT_APPROVED',
    'DOCUMENT_REJECTED',
    'DOCUMENT_RESUBMISSION_REQUESTED',
    'DOCUMENT_EXPIRED',
    'NOTIFICATION_SENT',
    'OFFICER_COMMENT_ADDED',
    'REQUIREMENT_ADDED',
    'REQUIREMENT_REMOVED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Column additions ──────────────────────────────────────────────────────────

ALTER TABLE "stores"
  ADD COLUMN IF NOT EXISTS "riskLevel" TEXT NOT NULL DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now();

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "storeId" TEXT;

-- ── New tables ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "certificate_types" (
  "id"              TEXT NOT NULL,
  "name"            TEXT NOT NULL,
  "description"     TEXT,
  "defaultRequired" BOOLEAN NOT NULL DEFAULT true,
  "active"          BOOLEAN NOT NULL DEFAULT true,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "certificate_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "certificate_types_name_key" ON "certificate_types"("name");

CREATE TABLE IF NOT EXISTS "certificate_type_requirements" (
  "id"                TEXT NOT NULL,
  "storeId"           TEXT NOT NULL,
  "certificateTypeId" TEXT NOT NULL,
  "required"          BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT "certificate_type_requirements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "certificate_type_requirements_storeId_certificateTypeId_key"
  ON "certificate_type_requirements"("storeId", "certificateTypeId");

CREATE TABLE IF NOT EXISTS "certificates" (
  "id"                TEXT NOT NULL,
  "storeId"           TEXT NOT NULL,
  "certificateTypeId" TEXT,
  "typeName"          TEXT NOT NULL,
  "fileKey"           TEXT,
  "fileName"          TEXT,
  "fileSize"          INTEGER,
  "status"            "DocumentStatus" NOT NULL DEFAULT 'MISSING',
  "referenceNo"       TEXT,
  "issuedAt"          TIMESTAMP(3),
  "expiresAt"         TIMESTAMP(3),
  "notes"             TEXT,
  "uploadedAt"        TIMESTAMP(3),
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "certificates_storeId_idx"   ON "certificates"("storeId");
CREATE INDEX IF NOT EXISTS "certificates_status_idx"    ON "certificates"("status");
CREATE INDEX IF NOT EXISTS "certificates_expiresAt_idx" ON "certificates"("expiresAt");

CREATE TABLE IF NOT EXISTS "certificate_reviews" (
  "id"            TEXT NOT NULL,
  "certificateId" TEXT NOT NULL,
  "reviewedById"  TEXT NOT NULL,
  "decision"      "ReviewDecision" NOT NULL,
  "comment"       TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "certificate_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "certificate_reviews_certificateId_idx" ON "certificate_reviews"("certificateId");

CREATE TABLE IF NOT EXISTS "compliance_audit_events" (
  "id"            TEXT NOT NULL,
  "eventType"     "AuditEventType" NOT NULL,
  "storeId"       TEXT,
  "certificateId" TEXT,
  "actorId"       TEXT,
  "actorName"     TEXT,
  "details"       JSONB,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "compliance_audit_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "compliance_audit_events_storeId_idx"       ON "compliance_audit_events"("storeId");
CREATE INDEX IF NOT EXISTS "compliance_audit_events_certificateId_idx" ON "compliance_audit_events"("certificateId");
CREATE INDEX IF NOT EXISTS "compliance_audit_events_createdAt_idx"     ON "compliance_audit_events"("createdAt");

CREATE TABLE IF NOT EXISTS "compliance_notifications" (
  "id"      TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "type"    TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "sentAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt"  TIMESTAMP(3),

  CONSTRAINT "compliance_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "compliance_notifications_storeId_idx" ON "compliance_notifications"("storeId");

-- ── Foreign keys ──────────────────────────────────────────────────────────────

ALTER TABLE "users"
  ADD CONSTRAINT "users_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "stores"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
  NOT VALID;  -- NOT VALID skips checking existing rows

ALTER TABLE "certificate_type_requirements"
  ADD CONSTRAINT "certificate_type_requirements_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "stores"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "certificate_type_requirements"
  ADD CONSTRAINT "certificate_type_requirements_certificateTypeId_fkey"
    FOREIGN KEY ("certificateTypeId") REFERENCES "certificate_types"("id")
    ON UPDATE CASCADE;

ALTER TABLE "certificates"
  ADD CONSTRAINT "certificates_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "stores"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "certificates"
  ADD CONSTRAINT "certificates_certificateTypeId_fkey"
    FOREIGN KEY ("certificateTypeId") REFERENCES "certificate_types"("id")
    ON UPDATE CASCADE;

ALTER TABLE "certificate_reviews"
  ADD CONSTRAINT "certificate_reviews_certificateId_fkey"
    FOREIGN KEY ("certificateId") REFERENCES "certificates"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "certificate_reviews"
  ADD CONSTRAINT "certificate_reviews_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "users"("id")
    ON UPDATE CASCADE;

ALTER TABLE "compliance_audit_events"
  ADD CONSTRAINT "compliance_audit_events_certificateId_fkey"
    FOREIGN KEY ("certificateId") REFERENCES "certificates"("id")
    ON UPDATE CASCADE;

ALTER TABLE "compliance_audit_events"
  ADD CONSTRAINT "compliance_audit_events_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "users"("id")
    ON UPDATE CASCADE;

ALTER TABLE "compliance_notifications"
  ADD CONSTRAINT "compliance_notifications_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "stores"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
