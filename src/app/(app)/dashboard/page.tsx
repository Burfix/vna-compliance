import { getEnv } from "@/lib/env";
import { dashboardMetrics, riskStores, riskPrecincts, recentAudits, mockUser } from "@/lib/mock";
import { getCategoryColor, getPrecinctIcon, getCategoryLabel } from "@/lib/precincts";
import Link from "next/link";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const env = getEnv();
  const session = await auth();

  // In mock mode, use mock data
  // In real mode, fetch from database
  const user = env.MOCK_MODE ? mockUser : session?.user;
  const metrics = env.MOCK_MODE ? dashboardMetrics : await getRealMetrics();
  const topRiskTenants = env.MOCK_MODE ? riskStores : await getRealRiskStores();
  const topRiskPrecincts = env.MOCK_MODE ? riskPrecincts : await getRealRiskPrecincts();
  const recent = env.MOCK_MODE ? recentAudits : await getRealRecentAudits();

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
          value={metrics.totalStores}
          icon="🏪"
          color="blue"
        />
        <KPICard
          title="Non-Compliant"
          value={metrics.nonCompliantStores}
          icon="⚠️"
          color="red"
        />
        <KPICard
          title="Audits This Month"
          value={metrics.auditsThisMonth}
          icon="📋"
          color="green"
        />
        <KPICard
          title="Open Actions"
          value={metrics.openActions}
          icon="✓"
          color="purple"
        />
      </div>

      {/* Avg Compliance Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Average Compliance Score</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {metrics.avgComplianceScore.toFixed(1)}%
            </p>
          </div>
          <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
            <span className="text-4xl">📊</span>
          </div>
        </div>
      </div>

      {/* Highest Risk Precincts - NEW */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Highest Risk Precincts</h3>
          <p className="text-sm text-gray-500">Precincts requiring attention</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topRiskPrecincts.map((precinct) => (
              <div
                key={precinct.precinct}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{getPrecinctIcon(precinct.precinct)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{precinct.precinct}</p>
                    <p className="text-sm text-gray-500">
                      {precinct.tenantsAudited} tenants audited
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getScoreColor(precinct.avgScore)}`}>
                    {precinct.avgScore}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {precinct.openActions} open actions
                  </p>
                </div>
                <div className="ml-4">
                  {getRiskBadge(precinct.riskLevel)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risk Tenants - UPDATED */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Risk Tenants</h3>
            <p className="text-sm text-gray-500">Tenants requiring attention</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topRiskTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{tenant.name}</p>
                      <p className="text-sm text-gray-500">{tenant.unitCode}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getScoreColor(tenant.lastScore)}`}>
                        {tenant.lastScore}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tenant.lastAuditDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                      {tenant.precinct}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(tenant.category)}`}>
                      {getCategoryLabel(tenant.category)}
                    </span>
                    {getRiskBadge(tenant.riskLevel)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Audits */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Audits</h3>
            <p className="text-sm text-gray-500">Latest audit activity</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recent.map((audit) => (
                <Link
                  key={audit.id}
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
                      {audit.score && (
                        <span className={`text-sm font-semibold ${getScoreColor(audit.score)}`}>
                          {audit.score}%
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex gap-4">
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

// Helper Components
function KPICard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
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

// Placeholder functions for real data fetching
async function getRealMetrics() {
  // TODO: Implement real database queries
  return {
    totalStores: 0,
    nonCompliantStores: 0,
    auditsThisMonth: 0,
    openActions: 0,
    avgComplianceScore: 0,
  };
}

async function getRealRiskStores() {
  // TODO: Implement real database queries
  return [];
}

async function getRealRiskPrecincts() {
  // TODO: Implement real database queries
  return [];
}

async function getRealRecentAudits() {
  // TODO: Implement real database queries
  return [];
}
