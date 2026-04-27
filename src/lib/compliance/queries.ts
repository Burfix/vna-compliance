import { db } from "@/lib/db";
import { DocumentStatus } from "@prisma/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ComplianceSummary = {
  totalStores: number;
  compliantStores: number;
  nonCompliantStores: number;
  overallPct: number;
  expired: number;
  expiringSoon: number;
  missing: number;
  awaitingReview: number;
  rejected: number;
};

export type StoreSummary = {
  id: string;
  name: string;
  code: string;
  precinct: string;
  category: string;
  riskLevel: string;
  compliancePct: number;
  approved: number;
  expiringSoon: number;
  expired: number;
  missing: number;
  awaitingReview: number;
  rejected: number;
  total: number;
};

export type CertificateRow = {
  id: string;
  typeName: string;
  status: DocumentStatus;
  referenceNo: string | null;
  issuedAt: Date | null;
  expiresAt: Date | null;
  notes: string | null;
  uploadedAt: Date | null;
  fileName: string | null;
  storeId: string;
  storeName: string;
};

export type ReviewQueueItem = {
  id: string;
  typeName: string;
  fileName: string | null;
  fileKey: string | null;
  uploadedAt: Date | null;
  expiresAt: Date | null;
  storeId: string;
  storeName: string;
  storeCode: string;
  precinct: string;
  riskLevel: "low" | "medium" | "high";
};

export type RiskFlag = {
  storeId: string;
  storeName: string;
  storeCode: string;
  precinct: string;
  flag: "EXPIRED" | "MISSING" | "REJECTED" | "EXPIRING_SOON";
  typeName: string;
  expiresAt: Date | null;
  daysUntilExpiry: number | null;
};

export type AuditEventRow = {
  id: string;
  eventType: string;
  storeId: string | null;
  certificateId: string | null;
  actorName: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function compliancePct(approved: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((approved / total) * 1000) / 10;
}

function riskLevel(pct: number, expired: number): "low" | "medium" | "high" {
  if (expired > 0 || pct < 50) return "high";
  if (pct < 80) return "medium";
  return "low";
}

// ── Precinct / Executive Summary ──────────────────────────────────────────────

export async function getComplianceSummary(): Promise<ComplianceSummary> {
  const certs = await db.certificate.findMany({
    where: { store: { active: true } },
    select: { status: true },
  });

  const counts = {
    approved: 0,
    expiringSoon: 0,
    expired: 0,
    missing: 0,
    awaitingReview: 0,
    rejected: 0,
  };

  for (const c of certs) {
    if (c.status === "APPROVED") counts.approved++;
    else if (c.status === "EXPIRING_SOON") counts.expiringSoon++;
    else if (c.status === "EXPIRED") counts.expired++;
    else if (c.status === "MISSING") counts.missing++;
    else if (c.status === "AWAITING_REVIEW") counts.awaitingReview++;
    else if (c.status === "REJECTED") counts.rejected++;
  }

  const stores = await db.store.findMany({
    where: { active: true },
    select: {
      id: true,
      certificates: { select: { status: true } },
    },
  });

  let compliant = 0;
  let nonCompliant = 0;
  for (const s of stores) {
    const hasIssue = s.certificates.some(
      (c) =>
        c.status === "EXPIRED" ||
        c.status === "MISSING" ||
        c.status === "REJECTED"
    );
    if (hasIssue) nonCompliant++;
    else compliant++;
  }

  return {
    totalStores: stores.length,
    compliantStores: compliant,
    nonCompliantStores: nonCompliant,
    overallPct: compliancePct(counts.approved, certs.length),
    expired: counts.expired,
    expiringSoon: counts.expiringSoon,
    missing: counts.missing,
    awaitingReview: counts.awaitingReview,
    rejected: counts.rejected,
  };
}

// ── Per-store summaries (for grid/table views) ────────────────────────────────

export async function getStoreSummaries(storeId?: string): Promise<StoreSummary[]> {
  const stores = await db.store.findMany({
    where: {
      active: true,
      ...(storeId ? { id: storeId } : {}),
    },
    include: {
      certificates: { select: { status: true } },
    },
    orderBy: { name: "asc" },
  });

  return stores.map((s) => {
    const approved = s.certificates.filter((c) => c.status === "APPROVED").length;
    const expiringSoon = s.certificates.filter((c) => c.status === "EXPIRING_SOON").length;
    const expired = s.certificates.filter((c) => c.status === "EXPIRED").length;
    const missing = s.certificates.filter((c) => c.status === "MISSING").length;
    const awaitingReview = s.certificates.filter((c) => c.status === "AWAITING_REVIEW").length;
    const rejected = s.certificates.filter((c) => c.status === "REJECTED").length;
    const total = s.certificates.length;
    const pct = compliancePct(approved, total);

    return {
      id: s.id,
      name: s.name,
      code: s.code,
      precinct: s.precinct,
      category: s.category,
      riskLevel: riskLevel(pct, expired),
      compliancePct: pct,
      approved,
      expiringSoon,
      expired,
      missing,
      awaitingReview,
      rejected,
      total,
    };
  });
}

// ── Tenant certificates (with optional storeId isolation) ─────────────────────

export async function getStoreCertificates(storeId: string): Promise<CertificateRow[]> {
  const rows = await db.certificate.findMany({
    where: { storeId },
    include: { store: { select: { id: true, name: true } } },
    orderBy: { typeName: "asc" },
  });

  return rows.map((c) => ({
    id: c.id,
    typeName: c.typeName,
    status: c.status,
    referenceNo: c.referenceNo,
    issuedAt: c.issuedAt,
    expiresAt: c.expiresAt,
    notes: c.notes,
    uploadedAt: c.uploadedAt,
    fileName: c.fileName,
    storeId: c.store.id,
    storeName: c.store.name,
  }));
}

// ── Review queue: all certs awaiting officer review ───────────────────────────

export async function getReviewQueue(): Promise<ReviewQueueItem[]> {
  const now = new Date();
  const soonThreshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const rows = await db.certificate.findMany({
    where: { status: "AWAITING_REVIEW" },
    include: {
      store: {
        select: { id: true, name: true, code: true, precinct: true },
      },
    },
    orderBy: { uploadedAt: "asc" },
  });

  return rows.map((c) => {
    const isAlreadyExpired = c.expiresAt ? c.expiresAt < now : false;
    const isExpiringSoon = c.expiresAt ? c.expiresAt <= soonThreshold : false;
    const rl: "low" | "medium" | "high" = isAlreadyExpired
      ? "high"
      : isExpiringSoon
      ? "medium"
      : "low";
    return {
      id: c.id,
      typeName: c.typeName,
      fileName: c.fileName,
      fileKey: c.fileKey,
      uploadedAt: c.uploadedAt,
      expiresAt: c.expiresAt,
      storeId: c.store.id,
      storeName: c.store.name,
      storeCode: c.store.code,
      precinct: c.store.precinct,
      riskLevel: rl,
    };
  });
}

// ── Risk Radar ────────────────────────────────────────────────────────────────

export async function getRiskFlags(): Promise<RiskFlag[]> {
  const now = new Date();
  const soonThreshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const rows = await db.certificate.findMany({
    where: {
      OR: [
        { status: "EXPIRED" },
        { status: "MISSING" },
        { status: "REJECTED" },
        { status: "EXPIRING_SOON" },
        {
          status: "APPROVED",
          expiresAt: { lte: soonThreshold },
        },
      ],
      store: { active: true },
    },
    include: {
      store: {
        select: { id: true, name: true, code: true, precinct: true },
      },
    },
    orderBy: { expiresAt: "asc" },
  });

  return rows.map((c) => {
    const days =
      c.expiresAt
        ? Math.ceil((c.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    return {
      storeId: c.store.id,
      storeName: c.store.name,
      storeCode: c.store.code,
      precinct: c.store.precinct,
      flag: c.status as "EXPIRED" | "MISSING" | "REJECTED" | "EXPIRING_SOON",
      typeName: c.typeName,
      expiresAt: c.expiresAt,
      daysUntilExpiry: days,
    };
  });
}

// ── Audit Trail ───────────────────────────────────────────────────────────────

export async function getAuditTrail(
  storeId?: string,
  limit = 100
): Promise<AuditEventRow[]> {
  const rows = await db.complianceAuditEvent.findMany({
    where: storeId ? { storeId } : {},
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    storeId: e.storeId,
    certificateId: e.certificateId,
    actorName: e.actorName,
    details: e.details as Record<string, unknown> | null,
    createdAt: e.createdAt,
  }));
}

// ── Weekly Report ─────────────────────────────────────────────────────────────

export async function getWeeklyReport() {
  const summary = await getComplianceSummary();
  const topRisks = await getRiskFlags();
  const queue = await getReviewQueue();
  const precincts = await db.store.groupBy({
    by: ["precinct"],
    where: { active: true },
    _count: { id: true },
  });

  return {
    generatedAt: new Date(),
    summary,
    topRisks: topRisks.slice(0, 20),
    queueDepth: queue.length,
    precincts: precincts.map((p) => ({ name: p.precinct, storeCount: p._count.id })),
  };
}
