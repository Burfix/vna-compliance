import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAuditTrail } from "@/lib/compliance/queries";

export const dynamic = "force-dynamic";

const EVENT_TYPES = [
  "DOCUMENT_UPLOADED",
  "DOCUMENT_APPROVED",
  "DOCUMENT_REJECTED",
  "NOTIFICATION_SENT",
  "OFFICER_COMMENT_ADDED",
  "REQUIREMENT_ADDED",
  "REQUIREMENT_REMOVED",
];

const eventLabels: Record<string, { label: string; icon: string; className: string }> = {
  DOCUMENT_UPLOADED: { label: "Document Uploaded", icon: "📤", className: "bg-blue-50 text-blue-700 border-blue-200" },
  DOCUMENT_APPROVED: { label: "Document Approved", icon: "✅", className: "bg-green-50 text-green-700 border-green-200" },
  DOCUMENT_REJECTED: { label: "Document Rejected", icon: "❌", className: "bg-orange-50 text-orange-700 border-orange-200" },
  NOTIFICATION_SENT: { label: "Notification Sent", icon: "🔔", className: "bg-gray-50 text-gray-600 border-gray-200" },
  OFFICER_COMMENT_ADDED: { label: "Comment Added", icon: "💬", className: "bg-purple-50 text-purple-700 border-purple-200" },
  REQUIREMENT_ADDED: { label: "Requirement Added", icon: "➕", className: "bg-teal-50 text-teal-700 border-teal-200" },
  REQUIREMENT_REMOVED: { label: "Requirement Removed", icon: "➖", className: "bg-gray-50 text-gray-600 border-gray-200" },
};

interface PageProps {
  searchParams: Promise<{ eventType?: string; actor?: string }>;
}

export default async function AuditTrailPage({ searchParams }: PageProps) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role !== "ADMIN" && role !== "OFFICER" && role !== "EXECUTIVE") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const activeType = params.eventType ?? "";
  const actorFilter = (params.actor ?? "").toLowerCase();

  const allEvents = await getAuditTrail(undefined, 300);

  const events = allEvents.filter((e) => {
    if (activeType && e.eventType !== activeType) return false;
    if (actorFilter && !(e.actorName ?? "").toLowerCase().includes(actorFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-purple-600 tracking-wide uppercase">
          Compliance Engine
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">Audit Trail</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tamper-evident log of all compliance activity — board and audit ready
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter:</span>
        <a
          href="/audit-trail"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            !activeType
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          All Events
        </a>
        {EVENT_TYPES.map((t) => {
          const cfg = eventLabels[t];
          return (
            <a
              key={t}
              href={`/audit-trail?eventType=${t}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeType === t
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {cfg.icon} {cfg.label}
            </a>
          );
        })}
        <span className="ml-auto text-xs text-gray-400">{events.length} event{events.length !== 1 ? "s" : ""}</span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">📜</p>
          <p className="text-sm text-gray-500">No events match this filter.</p>
          <a href="/audit-trail" className="text-xs text-blue-600 hover:underline mt-2 block">Clear filters</a>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((e) => {
                const cfg = eventLabels[e.eventType] ?? {
                  label: e.eventType,
                  icon: "•",
                  className: "bg-gray-50 text-gray-600 border-gray-200",
                };
                const details = e.details as Record<string, unknown> | null;
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.className}`}>
                        <span>{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      {e.actorName ?? <span className="text-gray-400 italic">System</span>}
                    </td>
                    <td className="px-5 py-3">
                      {details ? (
                        <ul className="text-xs text-gray-500 space-y-0.5">
                          {Object.entries(details)
                            .filter(([, v]) => v !== null && v !== undefined)
                            .map(([k, v]) => (
                              <li key={k}>
                                <span className="font-medium text-gray-600">{k.replace(/_/g, " ")}:</span>{" "}
                                {String(v)}
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
