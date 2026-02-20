import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getExecDashboardPayload,
  parseTimeframe,
} from "@/lib/exec-dashboard";
import type {
  PrecinctCard,
  ExpiryItem,
  TopRiskStore,
} from "@/lib/exec-dashboard";
import { getPrecinctIcon } from "@/lib/precincts";
import type { Precinct } from "@/lib/precincts";
import Sparkline from "@/components/Sparkline";
import TrendChart from "@/components/TrendChart";

export const dynamic = "force-dynamic";

// ────────────────── Page ──────────────────

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ExecDashboardPage({ searchParams }: Props) {
  /* ── Access control ─────────────────────────── */
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  /* ── Params ─────────────────────────────────── */
  const params = await searchParams;
  const timeframe = parseTimeframe(params.range as string | undefined);

  /* ── Data ───────────────────────────────────── */
  const payload = await getExecDashboardPayload(timeframe);

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600 tracking-wide uppercase">
            Executive View
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            Executive Compliance Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Boardroom-ready snapshot across all V&amp;A Waterfront precincts
          </p>
        </div>

        {/* Timeframe toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {[30, 90, 180].map((d) => (
            <Link
              key={d}
              href={`/exec?range=${d}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeframe === d
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {d}d
            </Link>
          ))}
        </div>
      </div>

      {/* ── Summary Strip ─────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryPill label="Total Stores" value={payload.summary.totalStores} />
        <SummaryPill
          label="Avg Compliance"
          value={`${payload.summary.avgCompliance}%`}
          color={payload.summary.avgCompliance >= 80 ? "green" : payload.summary.avgCompliance >= 60 ? "yellow" : "red"}
        />
        <SummaryPill
          label="Non-Compliant"
          value={payload.summary.totalNonCompliant}
          color="red"
        />
        <SummaryPill
          label="High Risk"
          value={payload.summary.totalHighRisk}
          color="red"
        />
        <SummaryPill
          label="Expired Certs"
          value={payload.summary.totalExpired}
          color="orange"
        />
        <SummaryPill
          label="Expiring Soon"
          value={payload.summary.totalExpiringSoon}
          color="yellow"
        />
      </div>

      {/* ── Section 1: Precinct Heatmap ───────── */}
      <section>
        <SectionHeader
          title="Precinct Heatmap"
          subtitle="Compliance health by precinct — click to drill down"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {payload.precinctCards.map((p) => (
            <HeatCard key={p.precinct} card={p} />
          ))}
        </div>
      </section>

      {/* ── Section 2: Risk Trend ─────────────── */}
      <section>
        <SectionHeader
          title="Risk Trend Over Time"
          subtitle={`Compliance trend — last ${timeframe} days`}
        />
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-4">
          <TrendChart data={payload.riskTrend} metric="compliance" height={200} />
        </div>
      </section>

      {/* ── Section 3: Expiry Timeline ────────── */}
      <section>
        <SectionHeader
          title="Certification Expiry Timeline"
          subtitle="Upcoming certificate expirations across all tenants"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <ExpiryColumn
            label="Next 7 Days"
            items={payload.expiryTimeline.next7}
            accent="red"
          />
          <ExpiryColumn
            label="Next 30 Days"
            items={payload.expiryTimeline.next30}
            accent="orange"
          />
          <ExpiryColumn
            label="Next 60 Days"
            items={payload.expiryTimeline.next60}
            accent="yellow"
          />
        </div>
      </section>

      {/* ── Section 4: Top Risk Stores ────────── */}
      <section>
        <SectionHeader
          title="Top Risk Stores"
          subtitle="10 tenants requiring the most urgent attention"
        />
        <RiskTable stores={payload.topRiskStores} />
      </section>
    </div>
  );
}

// ────────────────── Sub-Components ──────────────────

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  const textColor: Record<string, string> = {
    red: "text-red-700",
    orange: "text-orange-700",
    yellow: "text-yellow-700",
    green: "text-green-700",
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-center">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-xl font-bold mt-1 ${
          color ? textColor[color] ?? "text-gray-900" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ── Heatmap Card ──

function heatColor(score: number, highRisk: number): string {
  if (highRisk >= 3 || score < 50)
    return "border-red-300 bg-red-50";
  if (highRisk >= 1 || score < 70)
    return "border-orange-300 bg-orange-50";
  if (score < 85)
    return "border-yellow-300 bg-yellow-50";
  return "border-green-300 bg-green-50";
}

function HeatCard({ card }: { card: PrecinctCard }) {
  const border = heatColor(card.avgComplianceScore, card.highRiskCount);

  return (
    <Link
      href={`/stores?precinct=${encodeURIComponent(card.precinct)}`}
      className={`block rounded-lg border-2 p-4 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${border}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">
          {getPrecinctIcon(card.precinct as Precinct)}
        </span>
        <h4 className="font-semibold text-gray-900 text-sm leading-tight">
          {card.precinct}
        </h4>
      </div>

      <p className="text-2xl font-bold text-gray-900">
        {card.avgComplianceScore}%
      </p>
      <p className="text-xs text-gray-500 mb-3">
        avg compliance · {card.storeCount} stores
      </p>

      <div className="flex flex-wrap gap-1.5">
        {card.highRiskCount > 0 && (
          <Link
            href={`/stores?precinct=${encodeURIComponent(card.precinct)}&filter=highrisk`}
            className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            🔥 {card.highRiskCount} high risk
          </Link>
        )}
        {card.expiringSoonCount > 0 && (
          <Link
            href={`/stores?precinct=${encodeURIComponent(card.precinct)}&filter=expiringsoon`}
            className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            ⏰ {card.expiringSoonCount} expiring
          </Link>
        )}
        {card.nonCompliantCount > 0 && (
          <Link
            href={`/stores?precinct=${encodeURIComponent(card.precinct)}&filter=noncompliant`}
            className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            ⚠️ {card.nonCompliantCount} non-compliant
          </Link>
        )}
      </div>
    </Link>
  );
}

// ── Expiry Column ──

function ExpiryColumn({
  label,
  items,
  accent,
}: {
  label: string;
  items: ExpiryItem[];
  accent: "red" | "orange" | "yellow";
}) {
  const accentBorder: Record<string, string> = {
    red: "border-t-red-500",
    orange: "border-t-orange-500",
    yellow: "border-t-yellow-500",
  };
  const accentBg: Record<string, string> = {
    red: "bg-red-50",
    orange: "bg-orange-50",
    yellow: "bg-yellow-50",
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 border-t-4 ${accentBorder[accent]} overflow-hidden`}
    >
      <div className={`px-4 py-3 ${accentBg[accent]}`}>
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 text-sm">{label}</h4>
          <span className="text-xs font-medium text-gray-500">
            {items.length} cert{items.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            ✅ No expirations
          </div>
        ) : (
          items.map((item, idx) => (
            <Link
              key={`${item.storeId}-${item.certType}-${idx}`}
              href={`/stores/${item.storeId}`}
              className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.storeName}
              </p>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-gray-500 truncate">
                  {item.certType}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {formatDate(item.expiresAt)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

// ── Risk Table ──

function RiskTable({ stores }: { stores: TopRiskStore[] }) {
  if (stores.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400 mt-4">
        No stores to display
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precinct
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issues
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stores.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/stores/${s.id}`}
                    className="group"
                  >
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-500">{s.code}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {s.precinct}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-sm font-bold ${scoreColor(s.complianceScore)}`}
                  >
                    {s.complianceScore}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Sparkline
                      points={s.sparklinePoints}
                      width={72}
                      height={20}
                      color={sparkColor(s.riskLevel)}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <RiskBadge level={s.riskLevel} />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {s.expiredCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                        ⚠ {s.expiredCount}
                      </span>
                    )}
                    {s.expiringSoonCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                        ⏰ {s.expiringSoonCount}
                      </span>
                    )}
                    {s.expiredCount === 0 && s.expiringSoonCount === 0 && (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  const cls: Record<string, string> = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded border ${cls[level]}`}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

// ── Utilities ──

function scoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-blue-600";
  if (score >= 70) return "text-yellow-600";
  return "text-red-600";
}

function sparkColor(level: "low" | "medium" | "high"): string {
  return level === "high"
    ? "#ef4444"
    : level === "medium"
      ? "#eab308"
      : "#22c55e";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}
