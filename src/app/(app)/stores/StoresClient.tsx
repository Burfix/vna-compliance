"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { StoreWithCompliance } from "@/lib/stores";
import Link from "next/link";

type GroupBy = "none" | "category" | "precinct" | "compliance";

interface StoresClientProps {
  stores: StoreWithCompliance[];
}

interface TenantData {
  id: string;
  slug: string;
  name: string;
  precinct: string;
  category: string;
  code: string;
  complianceScore: number;
  riskLabel: "Low" | "Medium" | "High";
  expiringSoonCount: number;
  expiredCount: number;
}

export default function StoresClient({ stores }: StoresClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tenants: TenantData[] = stores.map((store) => {
    const riskScore =
      store.expiredCount * 10 + store.expiringSoonCount * 5 + store.missingCount * 15;
    const riskLabel: "Low" | "Medium" | "High" =
      riskScore >= 30 ? "High" : riskScore >= 15 ? "Medium" : "Low";

    return {
      id: store.id,
      slug: store.slug,
      name: store.name,
      precinct: store.precinct,
      category: store.category,
      code: store.code,
      complianceScore: store.complianceScore,
      riskLabel,
      expiringSoonCount: store.expiringSoonCount,
      expiredCount: store.expiredCount,
    };
  });

  const summary = {
    total: tenants.length,
    nonCompliant: tenants.filter((t) => t.complianceScore < 85).length,
    highRisk: tenants.filter((t) => t.riskLabel === "High").length,
    expiringCerts: tenants.reduce((sum, t) => sum + t.expiringSoonCount, 0),
  };

  const [groupBy, setGroupBy] = useState<GroupBy>(
    (searchParams.get("group") as GroupBy) || "none"
  );

  const handleGroupChange = (newGroup: GroupBy) => {
    setGroupBy(newGroup);
    const params = new URLSearchParams(searchParams.toString());
    if (newGroup === "none") {
      params.delete("group");
    } else {
      params.set("group", newGroup);
    }
    router.push(`/stores?${params.toString()}`);
  };

  const groupedTenants = useMemo(() => {
    if (groupBy === "none") {
      return { ungrouped: tenants };
    }

    const groups: Record<string, TenantData[]> = {};

    tenants.forEach((tenant) => {
      let key: string;
      switch (groupBy) {
        case "category":
          key = tenant.category === "FB" ? "F&B" : tenant.category;
          break;
        case "precinct":
          key = tenant.precinct;
          break;
        case "compliance":
          key = tenant.complianceScore >= 85 ? "Compliant" : "Non-Compliant";
          break;
        default:
          key = "ungrouped";
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(tenant);
    });

    return groups;
  }, [tenants, groupBy]);

  if (tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🏪</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stores Found</h3>
          <p className="text-gray-600 mb-6">Run the seed command to populate stores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Store Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview and compliance tracking for V&A Waterfront stores
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stores</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏪</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{summary.nonCompliant}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{summary.highRisk}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{summary.expiringCerts}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Group by:</span>
        {(["none", "category", "precinct", "compliance"] as const).map((option) => (
          <button
            key={option}
            onClick={() => handleGroupChange(option)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              groupBy === option
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTenants).map(([groupName, groupStores]) => (
          <div key={groupName}>
            {groupBy !== "none" && (
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{groupName}</h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupStores.map((store) => (
                <Link key={store.slug} href={`/stores/${store.id}`}>
                  <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{store.name}</h4>
                        <p className="text-sm text-gray-500">{store.code}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          store.riskLabel === "High"
                            ? "bg-red-100 text-red-800"
                            : store.riskLabel === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {store.riskLabel}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Compliance</span>
                        <span className="font-medium">{store.complianceScore}%</span>
                      </div>
                      {store.expiringSoonCount > 0 && (
                        <div className="text-xs text-yellow-600">
                          ⏰ {store.expiringSoonCount} expiring soon
                        </div>
                      )}
                      {store.expiredCount > 0 && (
                        <div className="text-xs text-red-600">
                          ⚠️ {store.expiredCount} expired
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
