import Link from "next/link";
import {
  getFilteredAudits,
  parseAuditRange,
  getAuditFilterMeta,
} from "@/lib/store-filters";
import type { AuditRange } from "@/lib/store-filters";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AuditsPage({ searchParams }: Props) {
  const params = await searchParams;
  const range = parseAuditRange(params.range as string | undefined);
  const meta = getAuditFilterMeta(range);
  const { audits, total } = await getFilteredAudits(range);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{meta.title}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {meta.description}
            {total > 0 && <span className="ml-1">· {total} total</span>}
          </p>
        </div>
        <Link
          href="/audits/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Start New Audit
        </Link>
      </div>

      {/* Range filter pills */}
      <div className="flex items-center gap-2">
        {(["all", "this_month", "last_30"] as const).map((r) => {
          const labels: Record<AuditRange, string> = {
            all: "All",
            this_month: "This Month",
            last_30: "Last 30 Days",
          };
          const href = r === "all" ? "/audits" : `/audits?range=${r}`;
          return (
            <Link
              key={r}
              href={href}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                range === r
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {labels[r]}
            </Link>
          );
        })}
      </div>

      {/* Audit list */}
      {audits.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {range === "all" ? "No Audits Yet" : "No Audits in This Period"}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {range === "all"
              ? "Start your first audit to see it here."
              : "Try selecting a different time range."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/audits/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Your First Audit
            </Link>
            {range !== "all" && (
              <Link
                href="/audits"
                className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                View All Audits
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conducted By
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {audits.map((audit) => (
                <tr
                  key={audit.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/audits/${audit.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {audit.storeName}
                    </Link>
                    <p className="text-xs text-gray-500">{audit.storeCode}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {audit.templateName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {audit.conductedByName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(audit.auditDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        audit.status === "SUBMITTED"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      {audit.status === "SUBMITTED" ? "Submitted" : "Draft"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
