import { getEnv } from "@/lib/env";
import { dashboardMetrics } from "@/lib/mock";
import Link from "next/link";

export default function DemoPage() {
  const env = getEnv();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎨 Visual QA Demo
          </h1>
          <p className="text-lg text-gray-600">
            V&A Waterfront Compliance System
          </p>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatusItem
              label="Mock Mode"
              value={env.MOCK_MODE ? "ON" : "OFF"}
              status={env.MOCK_MODE ? "active" : "inactive"}
            />
            <StatusItem
              label="Demo Mode"
              value={env.DEMO_MODE ? "ON" : "OFF"}
              status={env.DEMO_MODE ? "active" : "inactive"}
            />
            <StatusItem
              label="Environment"
              value={env.NODE_ENV}
              status="info"
            />
            <StatusItem
              label="Database Required"
              value={env.MOCK_MODE ? "NO" : "YES"}
              status={env.MOCK_MODE ? "active" : "warning"}
            />
          </div>
        </div>

        {/* Mock Data Preview */}
        {env.MOCK_MODE && (
          <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mock Data Preview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Tenants" value={dashboardMetrics.totalStores} icon="🏪" />
              <MetricCard label="Non-Compliant" value={dashboardMetrics.nonCompliantStores} icon="⚠️" />
              <MetricCard label="Audits" value={dashboardMetrics.auditsThisMonth} icon="📋" />
              <MetricCard label="Actions" value={dashboardMetrics.openActions} icon="✓" />
            </div>
          </div>
        )}

        {/* Navigation Test Panel */}
        <div className="bg-white rounded-lg border-2 border-green-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Navigation Test</h2>
          <p className="text-sm text-gray-600 mb-4">
            Click through these links to test the visual flow:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <NavButton href="/dashboard" label="Dashboard" icon="📊" />
            <NavButton href="/audits/new" label="Start New Audit" icon="📋" />
            <NavButton href="/stores" label="Stores" icon="🏪" />
            <NavButton href="/settings" label="Settings" icon="⚙️" />
          </div>
        </div>

        {/* Test Flow */}
        <div className="bg-white rounded-lg border-2 border-purple-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Recommended Test Flow</h2>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <div>
                <Link href="/dashboard" className="font-medium text-blue-600 hover:underline">
                  Go to Dashboard
                </Link>
                <p className="text-gray-600">View KPIs, risk stores, and recent audits</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <div>
                <Link href="/audits/new" className="font-medium text-blue-600 hover:underline">
                  Start New Audit
                </Link>
                <p className="text-gray-600">Select a store and template, create draft audit</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <div>
                <span className="font-medium text-gray-900">View Audit Detail</span>
                <p className="text-gray-600">
                  {env.MOCK_MODE 
                    ? "You'll be redirected to the audit detail page automatically"
                    : "Click on an audit from the dashboard to view details"}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                4
              </span>
              <div>
                <span className="font-medium text-gray-900">Submit Audit</span>
                <p className="text-gray-600">Change status from DRAFT to SUBMITTED</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                5
              </span>
              <div>
                <Link href="/stores" className="font-medium text-blue-600 hover:underline">
                  Browse Stores
                </Link>
                <p className="text-gray-600">View all store locations</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Feature Status */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Feature Status</h2>
          <div className="space-y-2 text-sm">
            <FeatureStatus label="App Shell & Navigation" status="complete" />
            <FeatureStatus label="Dashboard with KPIs" status="complete" />
            <FeatureStatus label="Start New Audit Flow" status="complete" />
            <FeatureStatus label="Audit Detail View" status="complete" />
            <FeatureStatus label="Mock Mode Support" status="complete" />
            <FeatureStatus label="Stores Page" status="placeholder" />
            <FeatureStatus label="Settings Page" status="placeholder" />
            <FeatureStatus label="Full Scoring System" status="planned" />
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
          >
            ← Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "active" | "inactive" | "info" | "warning";
}) {
  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <span className={`inline-block px-2 py-1 text-xs font-semibold border rounded ${statusColors[status]}`}>
        {value}
      </span>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

function NavButton({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function FeatureStatus({ label, status }: { label: string; status: "complete" | "placeholder" | "planned" }) {
  const statusConfig = {
    complete: { icon: "✓", color: "text-green-600", bg: "bg-green-50" },
    placeholder: { icon: "○", color: "text-blue-600", bg: "bg-blue-50" },
    planned: { icon: "...", color: "text-gray-400", bg: "bg-gray-50" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-3 p-2 rounded">
      <span className={`w-6 h-6 rounded-full ${config.bg} flex items-center justify-center text-sm font-bold ${config.color}`}>
        {config.icon}
      </span>
      <span className="text-gray-900">{label}</span>
      <span className={`ml-auto text-xs font-medium ${config.color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
}
