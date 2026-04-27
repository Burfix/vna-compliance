import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRiskFlags } from "@/lib/compliance/queries";
import type { RiskFlag } from "@/lib/compliance/queries";

export const dynamic = "force-dynamic";

type Severity = "critical" | "warning" | "info";

/** Returns a human-readable urgency string for the Expiry column */
function urgencyText(f: RiskFlag): string {
  const now = Date.now();
  if (f.flag === "MISSING") return "No submission on record";
  if (f.flag === "REJECTED") {
    if (f.uploadedAt) {
      const days = Math.floor((now - f.uploadedAt.getTime()) / (1000 * 60 * 60 * 24));
      return `Awaiting resubmission for ${days} day${days !== 1 ? "s" : ""}`;
    }
    return "Awaiting resubmission";
  }
  if (f.daysUntilExpiry === null) return "—";
  if (f.daysUntilExpiry < 0) return `Overdue by ${Math.abs(f.daysUntilExpiry)} day${Math.abs(f.daysUntilExpiry) !== 1 ? "s" : ""}`;
  if (f.daysUntilExpiry === 0) return "Expires today";
  return `Expires in ${f.daysUntilExpiry} day${f.daysUntilExpiry !== 1 ? "s" : ""}`;
}

const flagConfig: Record<
  RiskFlag["flag"],
  { label: string; className: string; rowClass: string; severity: Severity; action: string }
> = {
  EXPIRED: {
    label: "Non-Compliant",
    className: "bg-red-100 text-red-700 border-red-200",
    rowClass: "border-l-4 border-l-red-500",
    severity: "critical",
    action: "Immediate renewal required",
  },
  REJECTED: {
    label: "Rejected — Resubmit",
    className: "bg-orange-100 text-orange-700 border-orange-200",
    rowClass: "border-l-4 border-l-orange-500",
    severity: "critical",
    action: "Resubmission required",
  },
  EXPIRING_SOON: {
    label: "Expiry Risk",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    rowClass: "border-l-4 border-l-yellow-400",
    severity: "warning",
    action: "Upload renewal within 30 days",
  },
  MISSING: {
    label: "Action Required",
    className: "bg-gray-100 text-gray-600 border-gray-300",
    rowClass: "border-l-4 border-l-gray-400",
    severity: "info",
    action: "Submit certificate immediately",
  },
};

const severityConfig: Record<Severity, { label: string; icon: string; headerClass: string; countClass: string }> = {
  critical: {
    label: "Critical",
    icon: "🔴",
    headerClass: "border-l-4 border-l-red-500 bg-red-50 px-4 py-3 rounded-t-xl",
    countClass: "text-red-600",
  },
  warning: {
    label: "Warning",
    icon: "🟡",
    headerClass: "border-l-4 border-l-yellow-400 bg-yellow-50 px-4 py-3 rounded-t-xl",
    countClass: "text-yellow-600",
  },
  info: {
    label: "Action Required",
    icon: "⚪",
    headerClass: "border-l-4 border-l-gray-400 bg-gray-50 px-4 py-3 rounded-t-xl",
    countClass: "text-gray-600",
  },
};

export default async function RiskRadarPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role !== "ADMIN" && role !== "OFFICER" && role !== "EXECUTIVE") {
    redirect("/dashboard");
  }

  const flags = await getRiskFlags();

  // Group by severity
  const bySeverity: Record<Severity, RiskFlag[]> = { critical: [], warning: [], info: [] };
  for (const f of flags) {
    bySeverity[flagConfig[f.flag].severity].push(f);
  }

  const counts = {
    expired: flags.filter((f) => f.flag === "EXPIRED").length,
    missing: flags.filter((f) => f.flag === "MISSING").length,
    rejected: flags.filter((f) => f.flag === "REJECTED").length,
    expiringSoon: flags.filter((f) => f.flag === "EXPIRING_SOON").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-red-600 tracking-wide uppercase">
          Risk Radar
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">
          Compliance Risk Flags
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Issues grouped by severity — action items for compliance officers
        </p>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Pill label="Non-Compliant" value={counts.expired} className="border-red-200 bg-red-50 text-red-700" />
        <Pill label="Rejected" value={counts.rejected} className="border-orange-200 bg-orange-50 text-orange-700" />
        <Pill label="Expiry Risk" value={counts.expiringSoon} className="border-yellow-200 bg-yellow-50 text-yellow-700" />
        <Pill label="Action Required" value={counts.missing} className="border-gray-200 bg-gray-50 text-gray-700" />
      </div>

      {flags.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-semibold text-gray-800">No risk flags</p>
          <p className="text-sm text-gray-500 mt-1">
            All certificates are compliant and up to date.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {(["critical", "warning", "info"] as Severity[]).map((sev) => {
            const sevFlags = bySeverity[sev];
            if (sevFlags.length === 0) return null;
            const cfg = severityConfig[sev];
            return (
              <section key={sev}>
                <div className={`${cfg.headerClass} flex items-center justify-between mb-0`}>
                  <div className="flex items-center gap-2">
                    <span>{cfg.icon}</span>
                    <h3 className="text-base font-bold text-gray-900">{cfg.label}</h3>
                    <span className={`text-sm font-semibold ${cfg.countClass}`}>
                      ({sevFlags.length})
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sevFlags.map((f, i) => {
                        const fcfg = flagConfig[f.flag];
                        const urgency = urgencyText(f);
                        const isOverdue = f.daysUntilExpiry !== null && f.daysUntilExpiry < 0;
                        return (
                          <tr key={i} className={`${fcfg.rowClass} hover:bg-gray-50`}>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900">{f.storeName}</p>
                              <p className="text-xs text-gray-400">{f.storeCode} · {f.precinct}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{f.typeName}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${fcfg.className}`}>
                                {fcfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className={`text-xs font-semibold ${isOverdue || f.flag === "EXPIRED" ? "text-red-600" : f.flag === "EXPIRING_SOON" ? "text-yellow-700" : "text-gray-600"}`}>
                                {urgency}
                              </p>
                              {f.expiresAt && (
                                <p className="text-xs text-gray-400 mt-0.5">{f.expiresAt.toLocaleDateString()}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 font-medium">
                              {fcfg.action}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pill({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`rounded-xl border px-5 py-4 text-center ${className}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
    </div>
  );
}
