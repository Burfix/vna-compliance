-- VNA Compliance Engine — Migration v2
-- Run this against your Vercel Postgres database after migration_v1/migration.sql
-- Safe to re-run: all statements use IF NOT EXISTS / DO $$ checks

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. New enums
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "DocumentStatus" AS ENUM (
    'MISSING', 'AWAITING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'EXPIRING_SOON'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ReviewDecision" AS ENUM (
    'APPROVED', 'REJECTED', 'REQUEST_RESUBMISSION'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Extend Role enum — add EXECUTIVE and TENANT
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EXECUTIVE';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'TENANT';
EXCEPTION WHEN others THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Extend users table — add store_id for tenant scoping
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS store_id TEXT REFERENCES stores(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Extend stores table — add risk_level cache column
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS risk_level TEXT NOT NULL DEFAULT 'low';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Certificate types registry (replaces hardcoded arrays)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS certificate_types (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name             TEXT UNIQUE NOT NULL,
  description      TEXT,
  default_required BOOLEAN NOT NULL DEFAULT TRUE,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Per-tenant certificate requirements (override defaults)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS certificate_type_requirements (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  store_id            TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  certificate_type_id TEXT NOT NULL REFERENCES certificate_types(id),
  required            BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(store_id, certificate_type_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Certificates table (replaces certifications)
--    Keep certifications table intact — new code uses certificates
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS certificates (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  store_id            TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  certificate_type_id TEXT REFERENCES certificate_types(id),
  type_name           TEXT NOT NULL,

  file_key            TEXT,
  file_name           TEXT,
  file_size           INTEGER,

  status              "DocumentStatus" NOT NULL DEFAULT 'MISSING',
  reference_no        TEXT,
  issued_at           TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,
  notes               TEXT,

  uploaded_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_store_id  ON certificates(store_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status    ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_expires   ON certificates(expires_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Certificate reviews (officer approve/reject decisions)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS certificate_reviews (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  certificate_id  TEXT NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  reviewed_by_id  TEXT NOT NULL REFERENCES users(id),
  decision        "ReviewDecision" NOT NULL,
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_reviews_cert_id ON certificate_reviews(certificate_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Compliance audit events (full audit trail)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compliance_audit_events (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  event_type      "AuditEventType" NOT NULL,
  store_id        TEXT,
  certificate_id  TEXT REFERENCES certificates(id),
  actor_id        TEXT REFERENCES users(id),
  actor_name      TEXT,
  details         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_store_id  ON compliance_audit_events(store_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_cert_id   ON compliance_audit_events(certificate_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created   ON compliance_audit_events(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Compliance notifications
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compliance_notifications (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  store_id  TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  type      TEXT NOT NULL,
  subject   TEXT NOT NULL,
  message   TEXT NOT NULL,
  sent_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_store_id ON compliance_notifications(store_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. Seed certificate types (V&A Waterfront standard requirements)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO certificate_types (id, name, description, default_required) VALUES
  (gen_random_uuid()::TEXT, 'Fire Safety Certificate',         'Annual fire safety compliance certificate', TRUE),
  (gen_random_uuid()::TEXT, 'Electrical Certificate of Compliance', 'Electrical COC issued by certified electrician', TRUE),
  (gen_random_uuid()::TEXT, 'Gas Certificate of Compliance',   'Gas installation COC (F&B required)', FALSE),
  (gen_random_uuid()::TEXT, 'OHS Compliance Certificate',      'Occupational Health & Safety compliance', TRUE),
  (gen_random_uuid()::TEXT, 'Public Liability Insurance',      'Current public liability policy certificate', TRUE),
  (gen_random_uuid()::TEXT, 'Food Safety Certificate',         'Food handlers & food safety compliance (F&B required)', FALSE),
  (gen_random_uuid()::TEXT, 'Liquor License',                  'City of Cape Town liquor license (if applicable)', FALSE)
ON CONFLICT (name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. Triggers: auto-update updated_at on certificates
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_certificates_updated_at ON certificates;
CREATE TRIGGER set_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. Views (convenience SQL views used by API layer)
-- ─────────────────────────────────────────────────────────────────────────────

-- v_store_compliance_summary: per-store totals for dashboard
CREATE OR REPLACE VIEW v_store_compliance_summary AS
SELECT
  s.id                                                          AS store_id,
  s.name,
  s.code,
  s.precinct,
  s.category::TEXT,
  s.risk_level,
  COUNT(c.id)                                                   AS total_certs,
  COUNT(c.id) FILTER (WHERE c.status = 'APPROVED')              AS approved,
  COUNT(c.id) FILTER (WHERE c.status = 'EXPIRING_SOON')         AS expiring_soon,
  COUNT(c.id) FILTER (WHERE c.status = 'EXPIRED')               AS expired,
  COUNT(c.id) FILTER (WHERE c.status = 'MISSING')               AS missing,
  COUNT(c.id) FILTER (WHERE c.status = 'AWAITING_REVIEW')       AS awaiting_review,
  COUNT(c.id) FILTER (WHERE c.status = 'REJECTED')              AS rejected,
  CASE
    WHEN COUNT(c.id) = 0 THEN 0
    ELSE ROUND(
      (COUNT(c.id) FILTER (WHERE c.status = 'APPROVED')::NUMERIC
       / COUNT(c.id)::NUMERIC) * 100, 1
    )
  END                                                           AS compliance_pct
FROM stores s
LEFT JOIN certificates c ON c.store_id = s.id
WHERE s.active = TRUE
GROUP BY s.id, s.name, s.code, s.precinct, s.category, s.risk_level;

-- v_precinct_compliance: roll-up by precinct for exec dashboard
CREATE OR REPLACE VIEW v_precinct_compliance AS
SELECT
  s.precinct,
  COUNT(DISTINCT s.id)                                               AS store_count,
  COUNT(c.id)                                                        AS total_certs,
  COUNT(c.id) FILTER (WHERE c.status = 'APPROVED')                  AS approved,
  COUNT(c.id) FILTER (WHERE c.status IN ('EXPIRED','MISSING','REJECTED')) AS non_compliant,
  CASE
    WHEN COUNT(c.id) = 0 THEN 0
    ELSE ROUND(
      (COUNT(c.id) FILTER (WHERE c.status = 'APPROVED')::NUMERIC
       / COUNT(c.id)::NUMERIC) * 100, 1
    )
  END                                                                AS compliance_pct
FROM stores s
LEFT JOIN certificates c ON c.store_id = s.id
WHERE s.active = TRUE
GROUP BY s.precinct;

-- v_expiring_soon: certs expiring within 60 days (for Risk Radar)
CREATE OR REPLACE VIEW v_expiring_soon AS
SELECT
  c.id,
  c.type_name,
  c.expires_at,
  DATE_PART('day', c.expires_at - NOW()) AS days_until_expiry,
  s.id   AS store_id,
  s.name AS store_name,
  s.code AS store_code,
  s.precinct
FROM certificates c
JOIN stores s ON s.id = c.store_id
WHERE c.status IN ('APPROVED', 'EXPIRING_SOON')
  AND c.expires_at IS NOT NULL
  AND c.expires_at <= NOW() + INTERVAL '60 days'
  AND c.expires_at > NOW()
ORDER BY c.expires_at ASC;
