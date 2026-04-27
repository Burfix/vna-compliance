import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getWeeklyReport } from "@/lib/compliance/queries";

export const dynamic = "force-dynamic";

export default async function WeeklyReportPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role !== "ADMIN" && role !== "OFFICER" && role !== "EXECUTIVE") {
    redirect("/dashboard");
  }

  const report = await getWeeklyReport();
  const { summary, topRisks, queueDepth, precincts, generatedAt } = report;

  const auditReadiness = summary.totalStores > 0
    ? Math.round((summary.compliantStores / summary.totalStores) * 100)
    : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto" id="weekly-report">
      {/* Demo banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm text-amber-800">
        <span>⚠️</span>
        <span className="font-medium">Demo data for V&amp;A Waterfront trial — not for distribution</span>
      </div>

      {/* Report header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">ForgeStack Compliance Engine</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Weekly Compliance Report</h1>
            <p className="text-sm text-gray-500 mt-1">V&amp;A Waterfront Precinct · {generatedAt.toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <button
            onClick={undefined}
            className="print:hidden px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700"
            type="button"
            // Use window.print() via a client component — see below
          >
            🖨 Print / Export PDF
          </button>
        </div>
      </div>

      {/* KPI summary */}
      <section>
        <h2 className="text-base font-bold text-gray-900 mb-4">Compliance Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPI label="Total Tenants" value={summary.totalStores} />
          <KPI label="Compliant" value={summary.compliantStores} color="green" />
          <KPI label="Non-Compliant" value={summary.nonCompliantStores} color="red" />
          <KPI label="Expiring Soon" value={summary.expiringSoon} color="yellow" />
          <KPI label="Audit Readiness" value={`${auditReadiness}%`} color={auditReadiness >= 80 ? "green" : auditReadiness >= 60 ? "yellow" : "red"} />
        </div>
      </section>

      {/* Queue depth */}
      <section className="bg-blue-50 rounded-xl border border-blue-200 px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm font-semibold text-blue-800">Certificates Awaiting Review</p>
            <p className="text-xs text-blue-600 mt-0.5">Items in officer review queue</p>
          </div>
          <span className="text-4xl font-bold text-blue-700">{queueDepth}</span>
        </div>
      </section>

      {/* Precinct breakdown */}
      <section>
        <h2 className="text-base font-bold text-gray-900 mb-4">Precinct Tenant Count</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precinct</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tenants</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {precincts
                .sort((a, b) => b.storeCount - a.storeCount)
                .map((p) => (
                  <tr key={p.name} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 text-right font-semibold">{p.storeCount}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top risk items */}
      {topRisks.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-1">Top Risk Items</h2>
          <p className="text-xs text-gray-500 mb-4">Certificates requiring immediate officer action</p>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precinct</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topRisks.map((f, i) => {
                  const flagLabels: Record<string, string> = {
                    EXPIRED: "Non-Compliant",
                    MISSING: "Action Required",
                    REJECTED: "Resubmission Required",
                    EXPIRING_SOON: "Expiry Risk",
                  };
                  const flagColors: Record<string, string> = {
                    EXPIRED: "bg-red-50 text-red-700 border-red-200",
                    MISSING: "bg-gray-100 text-gray-600 border-gray-300",
                    REJECTED: "bg-orange-50 text-orange-700 border-orange-200",
                    EXPIRING_SOON: "bg-yellow-50 text-yellow-700 border-yellow-200",
                  };
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{f.storeName}</p>
                        <p className="text-xs text-gray-400">{f.storeCode}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{f.typeName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{f.precinct}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${flagColors[f.flag] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {flagLabels[f.flag] ?? f.flag}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-400 border-t border-gray-100 pt-4 text-center">
        Generated by ForgeStack Compliance Engine · {generatedAt.toLocaleString()} · V&amp;A Waterfront Trial
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  color = "default",
}: {
  label: string;
  value: number | string;
  color?: "green" | "red" | "yellow" | "default";
}) {
  const colors = {
    green: "text-green-700",
    red: "text-red-600",
    yellow: "text-yellow-600",
    default: "text-gray-900",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-4 text-center">
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
