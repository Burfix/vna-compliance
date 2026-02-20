import { getEnv } from "@/lib/env";
import { dashboardMetrics, riskStores, riskPrecincts, recentAudits, mockUser } from "@/lib/mock";
import { getCategoryColor, getPrecinctIcon, getCategoryLabel } from "@/lib/precincts";
import Link from "next/link";
import { auth } from "@/auth";
import { getDashboardPayload } from "@/lib/dashboard";
import type { DashboardPayload, PrecinctRisk, TenantRisk, RecentAudit } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const env = getEnv();
  const session = await auth();
  const user = env.MOCK_MODE ? mockUser : session?.user;

  // Fetch real data or fall back to mock
  let payload: DashboardPayload;
  if (env.MOCK_MODE) {
    payload = {
      totalStores: dashboardMetrics.totalStores,
      nonCompliantStores: dashboardMetrics.nonCompliantStores,
      highRiskStores: 0,
      expiringSoonCount: 0,
      auditsThisMonth: dashboardMetrics.auditsThisMonth,
      openActions: dashboardMetrics.openActions,
      avgComplianceScore: dashboardMetrics.avgComplianceScore,
      highestRiskPrecincts: riskPrecincts.map((p) => ({
        precinct: p.precinct,
        storeCount: p.tenantsAudited,
        highRiskCount: 0,
        avgCompliance: p.avgScore,
        expiredCount: p.openActions,
        riskLevel: p.riskLevel,
      })),
      topRiskTenants: riskStores.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.unitCode,
        precinct: s.precinct,
        category: s.category,
        complianceScore: s.lastScore,
        expiredCount: 0,
        expiringSoonCount: 0,
        missingCount: 0,
        riskLevel: s.riskLevel,
      })),
      recentAudits: recentAudits.map((a) => ({
        id: a.id,
        storeName: a.storeName,
        templateName: a.templateName,
        auditDate: a.auditDate.toISOString(),
        status: a.status,
      })),
    };
  } else {
    payload = await getDashboardPayload();
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || "User"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          V&A Waterfront Compliance Dashboard
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Tenants"
          value={payload.totalStores}
          icon="🏪"
          color="blue"
        />
        <KPICard
          title="Non-Compliant"
          value={payload.nonCompliantStores}
          icon="⚠️"
          color="red"
          subtitle={payload.highRiskStores > 0 ? `${payload.highRiskStores} high risk` : undefined}
        />
        <KPICard
          title="Audits This Month"
          value={payload.auditsThisMonth}
          icon="📋"
          color="green"
        />
        <KPICard
          title="Open Actions"
          value={payload.openActions}
          icon="🔧"
          color="purple"
          subtitle={payload.expiringSoonCount > 0 ? `${payload.expiringSoonCount} expiring soon` : undefined}
        />
      </div>

      {/* Avg Compliance Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">Average Compliance Score</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {payload.avgComplianceScore.toFixed(1)}%
            </p>
            <div className="mt-3 w-full max-w-md">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getProgressBarColor(payload.avgComplianceScore)}`}
                  style={{ width: `${Math.min(payload.avgComplianceScore, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
            <span className="text-4xl">📊</span>
          </div>
        </div>
      </div>

      {/* Highest Risk Precincts */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Highest Risk Precincts</h3>
          <p className="text-sm text-gray-500">Precincts ranked by compliance risk</p>
        </div>
        <div className="p-6">
          {payload.highestRiskPrecincts.length === 0 ? (
            <EmptyState message="No precinct data available yet" icon="🏘️" />
          ) : (
            <div className="space-y-4">
              {payload.highestRiskPrecincts.map((precinct) => (
                <PrecinctRow key={precinct.precinct} precinct={precinct} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risk Tenants */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Risk Tenants</h3>
            <p className="text-sm text-gray-500">Tenants requiring attention</p>
          </div>
          <div className="p-6">
            {payload.topRiskTenants.length === 0 ? (
              <EmptyState message="No tenant risk data — add certifications to stores" icon="🏪" />
            ) : (
              <div className="space-y-4">
                {payload.topRiskTenants.map((tenant) => (
                  <TenantRow key={tenant.id} tenant={tenant} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Audits */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Audits</h3>
            <p className="text-sm text-gray-500">Latest audit activity</p>
          </div>
          <div className="p-6">
            {payload.recentAudits.length === 0 ? (
              <EmptyState
                message="No audits yet — start your first audit"
                icon="📋"
                actionLabel="Start New Audit"
                actionHref="/audits/new"
              />
            ) : (
              <div className="space-y-4">
                {payload.recentAudits.map((audit) => (
                  <AuditRow key={audit.id} audit={audit} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/audits/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <span>📋</span>
            Start New Audit
          </Link>
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <span>🏪</span>
            View All Stores
          </Link>
        </div>
      </div>
    </div>
  );
}

// --------------- Sub-Components ---------------

function PrecinctRow({ precinct }: { precinct: PrecinctRisk }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-2xl">{getPrecinctIcon(precinct.precinct as Parameters<typeof getPrecinctIcon>[0])}</span>
        <div>
          <p className="font-medium text-gray-900">{precinct.precinct}</p>
          <p className="text-sm text-gray-500">
            {precinct.storeCount} stores · {precinct.expiredCount} expired certs
          </p>
        </div>
      </div>
      <div className="text-right mr-3">
        <p className={`text-lg font-bold ${getScoreColor(precinct.avgCompliance)}`}>
          {precinct.avgCompliance}%
        </p>
        <p className="text-xs text-gray-500">avg compliance</p>
      </div>
      <div>{getRiskBadge(precinct.riskLevel)}</div>
    </div>
  );
}

function TenantRow({ tenant }: { tenant: TenantRisk }) {
  return (
    <Link
      href={`/stores/${tenant.id}`}
      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{tenant.name}</p>
          <p className="text-sm text-gray-500">{tenant.code}</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${getScoreColor(tenant.complianceScore)}`}>
            {tenant.complianceScore}%
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap mt-2">
        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
          {tenant.precinct}
        </span>
        <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(tenant.category as Parameters<typeof getCategoryColor>[0])}`}>
          {getCategoryLabel(tenant.category as Parameters<typeof getCategoryLabel>[0])}
        </span>
        {getRiskBadge(tenant.riskLevel)}
        {tenant.expiredCount > 0 && (
          <span className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200">
            ⚠ {tenant.expiredCount} expired
          </span>
        )}
        {tenant.expiringSoonCount > 0 && (
          <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded border border-orange-200">
            ⏰ {tenant.expiringSoonCount} expiring
          </span>
        )}
      </div>
    </Link>
  );
}

function AuditRow({ audit }: { audit: RecentAudit }) {
  return (
    <Link
      href={`/audits/${audit.id}`}
      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{audit.storeName}</p>
          <p className="text-sm text-gray-600">{audit.templateName}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(audit.auditDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(audit.status)}
        </div>
      </div>
    </Link>
  );
}

function EmptyState({
  message,
  icon,
  actionLabel,
  actionHref,
}: {
  message: string;
  icon: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-gray-500 text-sm">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

// --------------- Helpers ---------------

function KPICard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
  subtitle?: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-blue-600";
  if (score >= 70) return "text-yellow-600";
  return "text-red-600";
}

function getProgressBarColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 80) return "bg-blue-500";
  if (score >= 70) return "bg-yellow-500";
  return "bg-red-500";
}

function getRiskBadge(level: string) {
  const badges = {
    low: <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-200 rounded">Low</span>,
    medium: <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 rounded">Medium</span>,
    high: <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 border border-red-200 rounded">High</span>,
  };
  return badges[level as keyof typeof badges] || badges.low;
}

function getStatusBadge(status: string) {
  const badges = {
    DRAFT: <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 rounded">Draft</span>,
    SUBMITTED: <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-200 rounded">Submitted</span>,
  };
  return badges[status as keyof typeof badges] || badges.DRAFT;
}
