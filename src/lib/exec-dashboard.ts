import { prisma } from "./db";

// ────────────────── Types ──────────────────

export interface PrecinctCard {
  precinct: string;
  storeCount: number;
  avgComplianceScore: number;
  highRiskCount: number;
  expiringSoonCount: number;
  nonCompliantCount: number;
}

export interface ExpiryItem {
  storeId: string;
  storeName: string;
  precinct: string;
  certType: string;
  expiresAt: string; // ISO string
  status: string;
}

export interface ExpiryTimeline {
  next7: ExpiryItem[];
  next30: ExpiryItem[];
  next60: ExpiryItem[];
}

export interface TopRiskStore {
  id: string;
  name: string;
  code: string;
  precinct: string;
  category: string;
  complianceScore: number;
  riskLevel: "low" | "medium" | "high";
  expiredCount: number;
  expiringSoonCount: number;
  sparklinePoints: number[];
}

export interface RiskTrendPoint {
  date: string; // YYYY-MM-DD
  overallRiskScore: number;
  avgComplianceScore: number;
}

export interface ExecDashboardPayload {
  precinctCards: PrecinctCard[];
  expiryTimeline: ExpiryTimeline;
  topRiskStores: TopRiskStore[];
  riskTrend: RiskTrendPoint[];
  summary: {
    totalStores: number;
    avgCompliance: number;
    totalExpired: number;
    totalExpiringSoon: number;
    totalHighRisk: number;
    totalNonCompliant: number;
  };
}

// ────────────────── Constants ──────────────────

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

// ────────────────── Helpers ──────────────────

function isExpiringSoon(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return expiresAt <= thirtyDays && expiresAt > now;
}

function computeRiskLevel(
  complianceScore: number,
  expiredCount: number,
): "low" | "medium" | "high" {
  if (complianceScore < 50 || expiredCount >= 3) return "high";
  if (complianceScore < 80 || expiredCount >= 1) return "medium";
  return "low";
}

/** Simple hash to get a deterministic integer from a string */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Seeded linear-congruential PRNG — deterministic per seed */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * Generate 8 sparkline points deterministically from a store id.
 * The last point is always the current compliance score.
 */
function generateSparkline(storeId: string, currentScore: number): number[] {
  const rng = seededRandom(hashCode(storeId));
  const points: number[] = [];
  let value = currentScore;

  // Walk backward 7 steps, then reverse so history comes first
  for (let i = 0; i < 7; i++) {
    const delta = (rng() - 0.45) * 14;
    value = Math.max(0, Math.min(100, value + delta));
    points.push(Math.round(value));
  }

  points.reverse();
  points.push(currentScore); // Ensure current value is last
  return points;
}

/**
 * Generate a synthetic risk-trend time series.
 * Starts ~15 points below current average and trends toward it,
 * seeded so it's deterministic across renders.
 */
function generateRiskTrend(
  avgCompliance: number,
  days: number,
): RiskTrendPoint[] {
  const rng = seededRandom(42);
  const points: RiskTrendPoint[] = [];
  const now = new Date();
  let compliance = Math.max(30, avgCompliance - 18);

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const step = (avgCompliance - compliance) / (i + 12);
    compliance += step + (rng() - 0.48) * 3;
    compliance = Math.max(0, Math.min(100, compliance));

    points.push({
      date: d.toISOString().split("T")[0],
      overallRiskScore: Math.round(100 - compliance),
      avgComplianceScore: Math.round(compliance),
    });
  }

  return points;
}

// ────────────────── Main Query ──────────────────

export function parseTimeframe(raw: string | undefined | null): number {
  const valid = [30, 90, 180];
  const n = Number(raw);
  return valid.includes(n) ? n : 90;
}

export async function getExecDashboardPayload(
  timeframeDays = 90,
): Promise<ExecDashboardPayload> {
  /* ── single efficient query ─────────────────────────── */
  const stores = await prisma.store.findMany({
    where: { active: true },
    include: { certifications: true },
  });

  const now = new Date();
  const day7 = new Date(now.getTime() + 7 * 86_400_000);
  const day30 = new Date(now.getTime() + 30 * 86_400_000);
  const day60 = new Date(now.getTime() + 60 * 86_400_000);

  /* ── per-store compliance metrics ───────────────────── */
  const storeMetrics = stores.map((store) => {
    const requiredCerts =
      store.category === "FB" ? REQUIRED_CERTS_FB : REQUIRED_CERTS_BASE;

    const expiredCount = store.certifications.filter(
      (c) => c.status === "EXPIRED",
    ).length;

    const expiringSoonCount = store.certifications.filter(
      (c) => c.status === "VALID" && isExpiringSoon(c.expiresAt),
    ).length;

    const validRequired = requiredCerts.filter((req) => {
      const cert = store.certifications.find((c) => c.type === req);
      return cert && cert.status === "VALID" && !isExpiringSoon(cert.expiresAt);
    }).length;

    const complianceScore =
      requiredCerts.length > 0
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
      riskLevel,
      expiredCount,
      expiringSoonCount,
      certifications: store.certifications,
    };
  });

  /* ── A) Precinct Cards ──────────────────────────────── */
  const precinctMap = new Map<string, (typeof storeMetrics)[number][]>();
  for (const s of storeMetrics) {
    const arr = precinctMap.get(s.precinct) ?? [];
    arr.push(s);
    precinctMap.set(s.precinct, arr);
  }

  const precinctCards: PrecinctCard[] = Array.from(precinctMap.entries())
    .map(([precinct, metrics]) => ({
      precinct,
      storeCount: metrics.length,
      avgComplianceScore: Math.round(
        metrics.reduce((sum, m) => sum + m.complianceScore, 0) / metrics.length,
      ),
      highRiskCount: metrics.filter(
        (m) => m.riskLevel === "high" || m.expiredCount >= 2,
      ).length,
      expiringSoonCount: metrics.reduce(
        (sum, m) => sum + m.expiringSoonCount,
        0,
      ),
      nonCompliantCount: metrics.filter(
        (m) => m.complianceScore < 80 || m.expiredCount > 0,
      ).length,
    }))
    .sort((a, b) => a.avgComplianceScore - b.avgComplianceScore);

  /* ── B) Expiry Timeline ─────────────────────────────── */
  const allExpiring = storeMetrics
    .flatMap((s) =>
      s.certifications
        .filter((c) => c.expiresAt && c.expiresAt > now && c.expiresAt <= day60)
        .map((c) => ({
          storeId: s.id,
          storeName: s.name,
          precinct: s.precinct,
          certType: c.type,
          expiresAt: c.expiresAt!.toISOString(),
          status: c.status,
          _ts: c.expiresAt!.getTime(),
        })),
    )
    .sort((a, b) => a._ts - b._ts);

  const strip = (items: typeof allExpiring): ExpiryItem[] =>
    items.map((c) => ({
      storeId: c.storeId,
      storeName: c.storeName,
      precinct: c.precinct,
      certType: c.certType,
      expiresAt: c.expiresAt,
      status: c.status,
    }));

  const expiryTimeline: ExpiryTimeline = {
    next7: strip(allExpiring.filter((c) => c._ts <= day7.getTime())),
    next30: strip(
      allExpiring.filter(
        (c) => c._ts > day7.getTime() && c._ts <= day30.getTime(),
      ),
    ),
    next60: strip(
      allExpiring.filter(
        (c) => c._ts > day30.getTime() && c._ts <= day60.getTime(),
      ),
    ),
  };

  /* ── C) Top Risk Stores ─────────────────────────────── */
  const riskOrder = { high: 0, medium: 1, low: 2 } as const;

  const topRiskStores: TopRiskStore[] = [...storeMetrics]
    .sort((a, b) => {
      const rDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      if (rDiff !== 0) return rDiff;
      return a.complianceScore - b.complianceScore;
    })
    .slice(0, 10)
    .map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      precinct: s.precinct,
      category: s.category,
      complianceScore: s.complianceScore,
      riskLevel: s.riskLevel,
      expiredCount: s.expiredCount,
      expiringSoonCount: s.expiringSoonCount,
      sparklinePoints: generateSparkline(s.id, s.complianceScore),
    }));

  /* ── D) Risk Trend ──────────────────────────────────── */
  const avgCompliance =
    storeMetrics.length > 0
      ? storeMetrics.reduce((sum, s) => sum + s.complianceScore, 0) /
        storeMetrics.length
      : 0;

  const riskTrend = generateRiskTrend(avgCompliance, timeframeDays);

  /* ── Summary ────────────────────────────────────────── */
  const summary = {
    totalStores: storeMetrics.length,
    avgCompliance: Math.round(avgCompliance),
    totalExpired: storeMetrics.reduce((sum, s) => sum + s.expiredCount, 0),
    totalExpiringSoon: storeMetrics.reduce(
      (sum, s) => sum + s.expiringSoonCount,
      0,
    ),
    totalHighRisk: storeMetrics.filter((s) => s.riskLevel === "high").length,
    totalNonCompliant: storeMetrics.filter(
      (s) => s.complianceScore < 80 || s.expiredCount > 0,
    ).length,
  };

  return { precinctCards, expiryTimeline, topRiskStores, riskTrend, summary };
}
