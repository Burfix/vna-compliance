"use client";

import type { CertificationData, StoreDetailData } from "./actions";
import type { CertificationType } from "@prisma/client";

interface CertificationPanelProps {
  data: StoreDetailData;
}

const certTypeLabels: Record<CertificationType, string> = {
  FIRE: "Fire Safety",
  ELECTRICAL: "Electrical",
  GAS: "Gas",
  OHS: "OHS",
  INSURANCE: "Insurance",
  FOOD_SAFETY: "Food Safety",
  LIQUOR_LICENSE: "Liquor License",
  OTHER: "Other",
};

const certTypeColors: Record<CertificationType, string> = {
  FIRE: "bg-red-100 text-red-800 border-red-200",
  ELECTRICAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
  GAS: "bg-orange-100 text-orange-800 border-orange-200",
  OHS: "bg-purple-100 text-purple-800 border-purple-200",
  INSURANCE: "bg-blue-100 text-blue-800 border-blue-200",
  FOOD_SAFETY: "bg-green-100 text-green-800 border-green-200",
  LIQUOR_LICENSE: "bg-pink-100 text-pink-800 border-pink-200",
  OTHER: "bg-gray-100 text-gray-800 border-gray-200",
};

function getStatusBadge(status: CertificationData["status"], isMandatory: boolean) {
  if (status === "EXPIRED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
        {isMandatory && <span className="font-bold">⚠</span>}
        <span>Expired</span>
      </span>
    );
  }
  if (status === "EXPIRING_SOON") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
        <span>Expiring Soon</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
      <span>✓</span>
      <span>Valid</span>
    </span>
  );
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function CertificationPanel({ data }: CertificationPanelProps) {
  const { certifications, certificationSummary } = data;

  // Group certifications by type
  const grouped = certifications.reduce((acc, cert) => {
    if (!acc[cert.type]) acc[cert.type] = [];
    acc[cert.type].push(cert);
    return acc;
  }, {} as Record<CertificationType, CertificationData[]>);

  const sortedTypes = Object.keys(grouped).sort() as CertificationType[];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900">Certifications & Compliance</h2>
        <p className="text-sm text-gray-500 mt-1">Document compliance and risk assessment</p>
      </div>

      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Valid</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{certificationSummary.totalValid}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{certificationSummary.expiringSoonCount}</p>
            <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Expired</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{certificationSummary.expiredCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Risk Adjustment</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">+{certificationSummary.riskAdjustment}</p>
            <p className="text-xs text-gray-500 mt-1">Points</p>
          </div>
        </div>
      </div>

      {/* Certifications List */}
      <div className="p-6">
        {certifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-gray-500 font-medium">No certifications on file</p>
            <p className="text-sm text-gray-400 mt-1">Add certifications to track compliance</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedTypes.map((type) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${certTypeColors[type]}`}>
                    {certTypeLabels[type]}
                  </span>
                  <span className="text-sm text-gray-500">
                    {grouped[type].length} {grouped[type].length === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="space-y-2">
                  {grouped[type].map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{cert.name}</p>
                          {cert.isMandatory && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 rounded">
                              Mandatory
                            </span>
                          )}
                        </div>
                        {cert.issuer && (
                          <p className="text-sm text-gray-500 mt-1">Issued by: {cert.issuer}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-700">Expiry Date</p>
                          <p className="text-sm text-gray-600">{formatDate(cert.expiryDate)}</p>
                        </div>
                        {getStatusBadge(cert.status, cert.isMandatory)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
