import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { DocumentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// Status display helpers
const statusConfig: Record<
  DocumentStatus,
  { label: string; className: string; dot: string }
> = {
  APPROVED: {
    label: "Approved",
    className: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  AWAITING_REVIEW: {
    label: "Awaiting Review",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  EXPIRING_SOON: {
    label: "Expiring Soon",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-500",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  MISSING: {
    label: "Missing",
    className: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-600",
  },
};

export default async function TenantPortalPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) redirect("/login");
  if (user.role !== "TENANT" && user.role !== "ADMIN" && user.role !== "OFFICER") {
    redirect("/dashboard");
  }

  // For tenant users — scope to their store
  // For staff reviewing on behalf of a tenant — this page is store-specific
  const storeId =
    user.role === "TENANT" ? user.storeId : null;

  if (user.role === "TENANT" && !storeId) {
    return (
      <div className="text-center py-16 text-gray-500">
        Your account is not linked to a tenant store. Please contact your compliance officer.
      </div>
    );
  }

  const store = storeId
    ? await db.store.findUnique({
        where: { id: storeId },
        select: { id: true, name: true, code: true, precinct: true },
      })
    : null;

  const certificates = storeId
    ? await db.certificate.findMany({
        where: { storeId },
        orderBy: { typeName: "asc" },
        include: {
          reviews: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { reviewedBy: { select: { name: true } } },
          },
        },
      })
    : [];

  const approved = certificates.filter((c) => c.status === "APPROVED").length;
  const total = certificates.length;
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

  const notifications = storeId
    ? await db.complianceNotification.findMany({
        where: { storeId, readAt: null },
        orderBy: { sentAt: "desc" },
        take: 5,
      })
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-green-600 tracking-wide uppercase">
          Tenant Portal
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">
          {store?.name ?? "Your Compliance Documents"}
        </h2>
        {store && (
          <p className="text-sm text-gray-500 mt-1">
            {store.code} · {store.precinct}
          </p>
        )}
      </div>

      {/* Unread notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3"
            >
              <span className="text-blue-500 mt-0.5">ℹ️</span>
              <div>
                <p className="text-sm font-medium text-blue-800">{n.subject}</p>
                <p className="text-xs text-blue-600 mt-0.5">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compliance score */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Overall Compliance</span>
          <span
            className={`text-2xl font-bold ${
              pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600"
            }`}
          >
            {pct}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${
              pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {approved} of {total} certificates approved
        </p>
      </div>

      {/* Certificate list */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Required Certificates
        </h3>

        {certificates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-400 text-sm">
              No certificates found. Your compliance officer will set up your requirements.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => {
              const cfg = statusConfig[cert.status];
              const lastReview = cert.reviews[0];
              const daysLeft =
                cert.expiresAt
                  ? Math.ceil(
                      (cert.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    )
                  : null;

              return (
                <div
                  key={cert.id}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-semibold text-gray-900">
                        {cert.typeName}
                      </h4>

                      {cert.fileName && (
                        <p className="text-xs text-gray-500 mt-1">
                          📎 {cert.fileName}
                        </p>
                      )}
                      {cert.expiresAt && (
                        <p
                          className={`text-xs mt-1 ${
                            daysLeft !== null && daysLeft < 0
                              ? "text-red-600 font-medium"
                              : daysLeft !== null && daysLeft <= 30
                              ? "text-yellow-600 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {daysLeft !== null && daysLeft < 0
                            ? `⚠️ Expired ${Math.abs(daysLeft)} days ago`
                            : daysLeft !== null && daysLeft <= 30
                            ? `⚠️ Expires in ${daysLeft} days`
                            : `Expires ${cert.expiresAt.toLocaleDateString()}`}
                        </p>
                      )}
                      {cert.referenceNo && (
                        <p className="text-xs text-gray-400 mt-1">
                          Ref: {cert.referenceNo}
                        </p>
                      )}

                      {/* Last review comment */}
                      {lastReview?.comment && (
                        <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 italic">
                            &ldquo;{lastReview.comment}&rdquo;
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            — {lastReview.reviewedBy.name ?? "Officer"},{" "}
                            {lastReview.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Upload action */}
                    {(cert.status === "MISSING" ||
                      cert.status === "REJECTED" ||
                      cert.status === "EXPIRED") && (
                      <div className="flex-shrink-0">
                        <UploadHint />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder upload hint — full upload requires Vercel Blob or similar
function UploadHint() {
  return (
    <div className="text-right">
      <span className="inline-block px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
        Upload required
      </span>
      <p className="text-xs text-gray-400 mt-1">Contact officer to upload</p>
    </div>
  );
}
