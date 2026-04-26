import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRiskFlags } from "@/lib/compliance/queries";
import type { RiskFlag } from "@/lib/compliance/queries";

export const dynamic = "force-dynamic";

const flagConfig: Record<
  RiskFlag["flag"],
  { label: string; className: string; rowClass: string; priority: number }
> = {
  EXPIRED: {
    label: "Expired",
    className: "bg-red-100 text-red-700 border-red-200",
    rowClass: "border-l-4 border-l-red-500",
    priority: 1,
  },
  MISSING: {
    label: "Missing",
    className: "bg-gray-100 text-gray-600 border-gray-300",
    rowClass: "border-l-4 border-l-gray-400",
    priority: 2,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-orange-100 text-orange-700 border-orange-200",
    rowClass: "border-l-4 border-l-orange-500",
    priority: 3,
  },
  EXPIRING_SOON: {
    label: "Expiring Soon",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    rowClass: "border-l-4 border-l-yellow-400",
    priority: 4,
  },
};

export default async function RiskRadarPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role !== "ADMIN" && role !== "OFFICER" && role !== "EXECUTIVE") {
    redirect("/dashboard");
  }

  const flags = await getRiskFlags();

  // Group by precinct
  const byPrecinct = flags.reduce<Record<string, RiskFlag[]>>((acc, f) => {
    if (!acc[f.precinct]) acc[f.precinct] = [];
    acc[f.precinct].push(f);
    return acc;
  }, {});

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
          All certificates requiring urgent attention across V&amp;A Waterfront
        </p>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Pill label="Expired" value={counts.expired} className="border-red-200 bg-red-50 text-red-700" />
        <Pill label="Missing" value={counts.missing} className="border-gray-200 bg-gray-50 text-gray-700" />
        <Pill label="Rejected" value={counts.rejected} className="border-orange-200 bg-orange-50 text-orange-700" />
        <Pill label="Expiring Soon" value={counts.expiringSoon} className="border-yellow-200 bg-yellow-50 text-yellow-700" />
      </div>

      {flags.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg font-semibold text-gray-800">No risk flags</p>
          <p className="text-sm text-gray-500 mt-1">
            All certificates are compliant and up to date.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byPrecinct)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([precinct, precinctFlags]) => (
              <section key={precinct}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-base font-semibold text-gray-900">{precinct}</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {precinctFlags.length} flag{precinctFlags.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Store
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Certificate
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Flag
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expiry
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {precinctFlags
                        .sort((a, b) => flagConfig[a.flag].priority - flagConfig[b.flag].priority)
                        .map((f, i) => {
                          const cfg = flagConfig[f.flag];
                          return (
                            <tr key={i} className={`${cfg.rowClass} hover:bg-gray-50`}>
                              <td className="px-4 py-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {f.storeName}
                                </p>
                                <p className="text-xs text-gray-400">{f.storeCode}</p>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {f.typeName}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.className}`}
                                >
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {f.expiresAt ? (
                                  <span
                                    className={
                                      f.daysUntilExpiry !== null && f.daysUntilExpiry < 0
                                        ? "text-red-600 font-medium"
                                        : ""
                                    }
                                  >
                                    {f.expiresAt.toLocaleDateString()}
                                    {f.daysUntilExpiry !== null && f.daysUntilExpiry < 0
                                      ? ` (${Math.abs(f.daysUntilExpiry)}d ago)`
                                      : f.daysUntilExpiry !== null
                                      ? ` (${f.daysUntilExpiry}d)`
                                      : ""}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}

function Pill({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`rounded-xl border px-5 py-4 text-center ${className}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
    </div>
  );
}
