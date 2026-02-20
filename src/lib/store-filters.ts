import { prisma } from "./db";
import type { StoreWithCompliance } from "./stores";

// --------------- Types ---------------

export type StoreFilter = "all" | "noncompliant" | "highrisk" | "expiringsoon" | "open_actions";
export type AuditRange = "this_month" | "last_30" | "all";

export interface FilterMeta {
  filter: StoreFilter;
  title: string;
  description: string;
  icon: string;
}

export interface AuditFilterMeta {
  range: AuditRange;
  title: string;
  description: string;
}

export interface AuditListItem {
  id: string;
  storeName: string;
  storeCode: string;
  templateName: string;
  conductedByName: string;
  auditDate: string;
  status: string;
}

// --------------- Constants ---------------

const REQUIRED_CERTS_BASE = [
  "Fire Safety Certificate",
  "Certificate of Occupancy",
  "Electrical Compliance (COC)",
  "Public Liability Insurance",
  "COID / Workman's Comp",
];

const REQUIRED_CERTS_FB = [
  ...REQUIRED_CERTS_BASE,
  "Health & Hygiene",
  "Gas Compliance",
];

// --------------- Helpers ---------------

function isExpiringSoon(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return expiresAt <= thirtyDaysFromNow && expiresAt > now;
}

function computeRiskLevel(
  complianceScore: number,
  expiredCount: number
): "low" | "medium" | "high" {
  if (complianceScore < 50 || expiredCount >= 3) return "high";
  if (complianceScore < 80 || expiredCount >= 1) return "medium";
  return "low";
}

// --------------- Filter Meta ---------------

export function getFilterMeta(filter: StoreFilter): FilterMeta {
  const meta: Record<StoreFilter, FilterMeta> = {
    all: {
      filter: "all",
      title: "All Tenants",
      description: "All active stores in V&A Waterfront",
      icon: "🏪",
    },
    noncompliant: {
      filter: "noncompliant",
      title: "Non-Compliant Stores",
      description: "Stores with compliance below 80% or expired certifications",
      icon: "⚠️",
    },
    highrisk: {
      filter: "highrisk",
      title: "High Risk Stores",
      description: "Stores with compliance below 50% or 3+ expired certifications",
      icon: "🔥",
    },
    expiringsoon: {
      filter: "expiringsoon",
      title: "Expiring Soon",
      description: "Stores with certifications expiring within 30 days",
      icon: "⏰",
    },
    open_actions: {
      filter: "open_actions",
      title: "Open Actions",
      description: "Stores with expired, missing, or expiring certifications requiring action",
      icon: "🔧",
    },
  };
  return meta[filter] ?? meta.all;
}

export function getAuditFilterMeta(range: AuditRange): AuditFilterMeta {
  const meta: Record<AuditRange, AuditFilterMeta> = {
    this_month: {
      range: "this_month",
      title: "Audits This Month",
      description: "Audits conducted in the current calendar month",
    },
    last_30: {
      range: "last_30",
      title: "Audits — Last 30 Days",
      description: "Audits conducted in the last 30 days",
    },
    all: {
      range: "all",
      title: "All Audits",
      description: "Complete audit history",
    },
  };
  return meta[range] ?? meta.all;
}

// --------------- Store Queries ---------------

export function parseStoreFilter(raw: string | undefined | null): StoreFilter {
  const valid: StoreFilter[] = ["all", "noncompliant", "highrisk", "expiringsoon", "open_actions"];
  return valid.includes(raw as StoreFilter) ? (raw as StoreFilter) : "all";
}

export function parseAuditRange(raw: string | undefined | null): AuditRange {
  const valid: AuditRange[] = ["this_month", "last_30", "all"];
  return valid.includes(raw as AuditRange) ? (raw as AuditRange) : "all";
}

/**
 * Fetches all active stores, computes compliance, then applies the
 * requested filter. Uses the same logic as dashboard.ts.
 */
export async function getFilteredStores(
  filter: StoreFilter,
  search?: string,
  precinct?: string,
  category?: string,
): Promise<{ stores: StoreWithCompliance[]; totalBeforeFilter: number }> {
  const stores = await prisma.store.findMany({
    where: { active: true },
    include: { certifications: true },
    orderBy: { name: "asc" },
  });

  // Compute compliance for every store
  const allStores: (StoreWithCompliance & {
    riskLevel: "low" | "medium" | "high";
    actionCount: number;
  })[] = stores.map((store) => {
    const requiredCerts =
      store.category === "FB" ? REQUIRED_CERTS_FB : REQUIRED_CERTS_BASE;

    const expiredCount = store.certifications.filter(
      (c) => c.status === "EXPIRED"
    ).length;

    const expiringSoonCount = store.certifications.filter(
      (c) => c.status === "VALID" && isExpiringSoon(c.expiresAt)
    ).length;

    const missingCount = store.certifications.filter(
      (c) => c.status === "MISSING"
    ).length;

    const validRequired = requiredCerts.filter((reqCert) => {
      const cert = store.certifications.find((c) => c.type === reqCert);
      return cert && cert.status === "VALID" && !isExpiringSoon(cert.expiresAt);
    }).length;

    const complianceScore = requiredCerts.length > 0
      ? Math.round((validRequired / requiredCerts.length) * 100)
      : 0;

    const riskLevel = computeRiskLevel(complianceScore, expiredCount);

    return {
      id: store.id,
      code: store.code,
      slug: store.slug,
      name: store.name,
      precinct: store.precinct,
      category: store.category,
      unitCode: store.unitCode,
      complianceScore,
      validCount: store.certifications.filter(
        (c) => c.status === "VALID" && !isExpiringSoon(c.expiresAt)
      ).length,
      expiredCount,
      expiringSoonCount,
      missingCount,
      riskLevel,
      actionCount: expiredCount + missingCount + expiringSoonCount,
    };
  });

  const totalBeforeFilter = allStores.length;

  // Apply filter
  let filtered = allStores;
  switch (filter) {
    case "noncompliant":
      filtered = allStores.filter((s) => s.complianceScore < 80 || s.expiredCount > 0);
      break;
    case "highrisk":
      filtered = allStores.filter((s) => s.riskLevel === "high");
      break;
    case "expiringsoon":
      filtered = allStores.filter((s) => s.expiringSoonCount > 0);
      break;
    case "open_actions":
      filtered = allStores.filter((s) => s.actionCount > 0);
      break;
    case "all":
    default:
      break;
  }

  // Apply optional text search
  if (search && search.trim().length > 0) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.precinct.toLowerCase().includes(q)
    );
  }

  // Apply optional precinct filter
  if (precinct && precinct.trim().length > 0) {
    filtered = filtered.filter(
      (s) => s.precinct.toLowerCase() === precinct.toLowerCase()
    );
  }

  // Apply optional category filter
  if (category && category.trim().length > 0) {
    filtered = filtered.filter(
      (s) => s.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Sort: for risk-oriented filters, sort by compliance ascending (worst first)
  if (filter === "noncompliant" || filter === "highrisk" || filter === "open_actions") {
    filtered.sort((a, b) => a.complianceScore - b.complianceScore);
  }

  return { stores: filtered, totalBeforeFilter };
}

// --------------- Audit Queries ---------------

export async function getFilteredAudits(
  range: AuditRange,
): Promise<{ audits: AuditListItem[]; total: number }> {
  const now = new Date();
  let dateFilter: Date | undefined;

  switch (range) {
    case "this_month":
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "last_30":
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "all":
    default:
      dateFilter = undefined;
      break;
  }

  const where = dateFilter ? { auditDate: { gte: dateFilter } } : {};

  const [audits, total] = await Promise.all([
    prisma.audit.findMany({
      where,
      orderBy: { auditDate: "desc" },
      take: 50,
      include: {
        store: { select: { name: true, code: true } },
        template: { select: { name: true } },
        conductedBy: { select: { name: true } },
      },
    }),
    prisma.audit.count({ where }),
  ]);

  return {
    audits: audits.map((a) => ({
      id: a.id,
      storeName: a.store.name,
      storeCode: a.store.code,
      templateName: a.template.name,
      conductedByName: a.conductedBy.name ?? "Unknown",
      auditDate: a.auditDate.toISOString(),
      status: a.status,
    })),
    total,
  };
}
