"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { TenantManagementData, TenantData } from "./actions";
import { TenantCard } from "./TenantCard";
import { mockStores } from "@/lib/mock";
import { getEnv } from "@/lib/env";

type GroupBy = "none" | "category" | "precinct" | "risk";

interface StoresClientProps {
  initialData: TenantManagementData;
}

export default function StoresClient({ initialData }: StoresClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const env = getEnv();
  
  // Use mock data if MOCK_MODE, otherwise use DB data
  const mockTenants: TenantData[] = env.MOCK_MODE ? mockStores.map(store => ({
    id: store.id,
    name: store.name,
    precinct: store.precinct,
    category: store.category,
    unitCode: store.unitCode,
    compliancePercent: Math.floor(Math.random() * 40) + 60, // 60-100%
    riskScore: Math.floor(Math.random() * 100),
    riskLabel: Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low",
    expiringCertCount: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
    expiredCertCount: Math.random() > 0.9 ? 1 : 0,
  })) : [];

  const data = env.MOCK_MODE ? {
    tenants: mockTenants,
    summary: {
      total: mockTenants.length,
      nonCompliant: mockTenants.filter(t => t.compliancePercent < 85).length,
      highRisk: mockTenants.filter(t => t.riskLabel === "High").length,
      expiringCerts: mockTenants.reduce((sum, t) => sum + t.expiringCertCount, 0),
    }
  } : initialData;

  const [groupBy, setGroupBy] = useState<GroupBy>((searchParams.get("group") as GroupBy) || "none");

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

  // Group tenants
  const groupedTenants = useMemo(() => {
    if (groupBy === "none") {
      return { ungrouped: data.tenants };
    }

    const groups: Record<string, TenantData[]> = {};
    
    data.tenants.forEach((tenant) => {
      let key: string;
      switch (groupBy) {
        case "category":
          key = tenant.category === "FB" ? "F&B" : tenant.category;
          break;
        case "precinct":
          key = tenant.precinct;
          break;
        case "risk":
          key = tenant.riskLabel;
          break;
        default:
          key = "ungrouped";
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(tenant);
    });

    return groups;
  }, [data.tenants, groupBy]);

  const getGroupStats = (tenants: TenantData[]) => {
    const avgCompliance = tenants.length > 0
      ? Math.round(tenants.reduce((sum, t) => sum + t.compliancePercent, 0) / tenants.length)
      : 0;
    const highRiskCount = tenants.filter(t => t.riskLabel === "High").length;
    
    return { avgCompliance, highRiskCount };
  };

  if (data.tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🏪</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tenants Found</h3>
          <p className="text-gray-600 mb-6">
            Seed demo tenants to activate management view
          </p>
          <a
            href="/api/admin/seed"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Seed Demo Data
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenant Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview and management of all V&A Waterfront tenants
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tenants</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.summary.total}</p>
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
              <p className="text-2xl font-bold text-orange-600 mt-1">{data.summary.nonCompliant}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{data.summary.highRisk}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚨</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Certs</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{data.summary.expiringCerts}</p>
              <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>
      </div>

      {/* Group By Control */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label htmlFor="groupBy" className="text-sm font-medium text-gray-700">
            Group By:
          </label>
          <select
            id="groupBy"
            value={groupBy}
            onChange={(e) => handleGroupChange(e.target.value as GroupBy)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="none">None</option>
            <option value="category">Category</option>
            <option value="precinct">Precinct</option>
            <option value="risk">Risk Level</option>
          </select>
          <span className="text-sm text-gray-500">
            {data.tenants.length} tenant{data.tenants.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grouped Tenant View */}
      <div className="space-y-6">
        {Object.entries(groupedTenants).map(([groupName, tenants]) => {
          const stats = getGroupStats(tenants);
          const isGrouped = groupBy !== "none";

          return (
            <div key={groupName}>
              {isGrouped && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{groupName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {tenants.length} tenant{tenants.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Avg Compliance</p>
                        <p className="text-xl font-bold text-gray-900">{stats.avgCompliance}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">High Risk</p>
                        <p className="text-xl font-bold text-red-600">{stats.highRiskCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tenants.map((tenant) => (
                  <TenantCard key={tenant.id} tenant={tenant} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
