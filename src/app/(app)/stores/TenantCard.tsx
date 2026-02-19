"use client";

import type { TenantData } from "./actions";

interface TenantCardProps {
  tenant: TenantData;
}

export function TenantCard({ tenant }: TenantCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "FB":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "RETAIL":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SERVICES":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-800 border-red-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getComplianceColor = (percent: number) => {
    if (percent >= 90) return "bg-green-500";
    if (percent >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 truncate">{tenant.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{tenant.unitCode}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded border ${getCategoryColor(tenant.category)}`}>
          {tenant.category === "FB" ? "F&B" : tenant.category}
        </span>
      </div>

      {/* Precinct */}
      <p className="text-xs text-gray-500 mb-3">{tenant.precinct}</p>

      {/* Compliance Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Compliance</span>
          <span className="text-xs font-semibold text-gray-900">{tenant.compliancePercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getComplianceColor(tenant.compliancePercent)}`}
            style={{ width: `${tenant.compliancePercent}%` }}
          />
        </div>
      </div>

      {/* Risk Badge */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 text-xs font-medium rounded border ${getRiskColor(tenant.riskLabel)}`}>
          Risk: {tenant.riskLabel}
        </span>
        {(tenant.expiringCertCount > 0 || tenant.expiredCertCount > 0) && (
          <span className="text-xs text-red-600 font-medium">⚠️ Cert Expiry</span>
        )}
      </div>
    </div>
  );
}
