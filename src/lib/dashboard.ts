import { prisma } from "./db";

// --------------- Types ---------------

export interface DashboardPayload {
  totalStores: number;
  nonCompliantStores: number;
  highRiskStores: number;
  expiringSoonCount: number;
  auditsThisMonth: number;
  openActions: number;
  avgComplianceScore: number;
  highestRiskPrecincts: PrecinctRisk[];
  topRiskTenants: TenantRisk[];
  recentAudits: RecentAudit[];
}

export interface PrecinctRisk {
  precinct: string;
  storeCount: number;
  highRiskCount: number;
  avgCompliance: number;
  expiredCount: number;
  riskLevel: "low" | "medium" | "high";
}

export interface TenantRisk {
  id: string;
  name: string;
  code: string;
  precinct: string;
  category: string;
  complianceScore: number;
  expiredCount: number;
  expiringSoonCount: number;
  missingCount: number;
  riskLevel: "low" | "medium" | "high";
}

export interface RecentAudit {
  id: string;
  storeName: string;
  templateName: string;
  auditDate: string; // ISO string for serialization
  status: string;
}

// --------------- Helpers ---------------

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

// --------------- Main Query ---------------

export async function getDashboardPayload(): Promise<DashboardPayload> {
  // Single query: all active stores with their certs
  const stores = await prisma.store.findMany({
    where: { active: true },
    include: {
      certifications: true,
    },
  });

  // Compute per-store compliance data
  const storeMetrics = stores.map((store) => {
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

    // Compliance = % of required certs that are VALID and not expiring soon
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
      name: store.name,
      code: store.code,
      precinct: store.precinct,
      category: store.category,
      complianceScore,
      expiredCount,
      expiringSoonCount,
      missingCount,
      riskLevel,
    };
  });

  // KPI aggregations
  const totalStores = storeMetrics.length;

  const nonCompliantStores = storeMetrics.filter(
    (s) => s.complianceScore < 80 || s.expiredCount > 0
  ).length;

  const highRiskStores = storeMetrics.filter(
    (s) => s.riskLevel === "high"
  ).length;

  const expiringSoonCount = storeMetrics.reduce(
    (sum, s) => sum + s.expiringSoonCount, 0
  );

  // openActions = total expired + missing certs (no findings table exists)
  const openActions = storeMetrics.reduce(
    (sum, s) => sum + s.expiredCount + s.missingCount, 0
  );

  const avgComplianceScore = totalStores > 0
    ? storeMetrics.reduce((sum, s) => sum + s.complianceScore, 0) / totalStores
    : 0;

  // Audits this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const auditsThisMonth = await prisma.audit.count({
    where: {
      auditDate: { gte: startOfMonth },
    },
  });

  // Recent audits (last 8)
  const rawAudits = await prisma.audit.findMany({
    take: 8,
    orderBy: { auditDate: "desc" },
    include: {
      store: { select: { name: true } },
      template: { select: { name: true } },
    },
  });

  const recentAudits: RecentAudit[] = rawAudits.map((a) => ({
    id: a.id,
    storeName: a.store.name,
    templateName: a.template.name,
    auditDate: a.auditDate.toISOString(),
    status: a.status,
  }));

  // Highest risk precincts — aggregate by precinct
  const precinctMap = new Map<string, {
    storeCount: number;
    highRiskCount: number;
    totalCompliance: number;
    expiredCount: number;
  }>();

  for (const s of storeMetrics) {
    const p = precinctMap.get(s.precinct) ?? {
      storeCount: 0,
      highRiskCount: 0,
      totalCompliance: 0,
      expiredCount: 0,
    };
    p.storeCount++;
    if (s.riskLevel === "high") p.highRiskCount++;
    p.totalCompliance += s.complianceScore;
    p.expiredCount += s.expiredCount;
    precinctMap.set(s.precinct, p);
  }

  const highestRiskPrecincts: PrecinctRisk[] = Array.from(precinctMap.entries())
    .map(([precinct, data]) => ({
      precinct,
      storeCount: data.storeCount,
      highRiskCount: data.highRiskCount,
      avgCompliance: Math.round(data.totalCompliance / data.storeCount),
      expiredCount: data.expiredCount,
      riskLevel: computeRiskLevel(
        Math.round(data.totalCompliance / data.storeCount),
        data.expiredCount
      ),
    }))
    // Sort: high risk first, then by avg compliance ascending
    .sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      const rDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      if (rDiff !== 0) return rDiff;
      return a.avgCompliance - b.avgCompliance;
    })
    .slice(0, 5);

  // Top risk tenants — top 8 by risk descending
  const topRiskTenants: TenantRisk[] = [...storeMetrics]
    .sort((a, b) => {
      // Sort by risk level first, then expired count desc, then compliance asc
      const riskOrder = { high: 0, medium: 1, low: 2 };
      const rDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      if (rDiff !== 0) return rDiff;
      const eDiff = b.expiredCount - a.expiredCount;
      if (eDiff !== 0) return eDiff;
      return a.complianceScore - b.complianceScore;
    })
    .slice(0, 8);

  return {
    totalStores,
    nonCompliantStores,
    highRiskStores,
    expiringSoonCount,
    auditsThisMonth,
    openActions,
    avgComplianceScore,
    highestRiskPrecincts,
    topRiskTenants,
    recentAudits,
  };
}
