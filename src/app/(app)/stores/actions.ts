"use server";

import { prisma } from "@/lib/db";
import type { Category } from "@prisma/client";

export interface TenantData {
  id: string;
  name: string;
  precinct: string;
  category: Category;
  unitCode: string;
  compliancePercent: number;
  riskScore: number;
  riskLabel: "Low" | "Medium" | "High";
  expiringCertCount: number;
  expiredCertCount: number;
}

export interface TenantSummary {
  total: number;
  nonCompliant: number;
  highRisk: number;
  expiringCerts: number;
}

export interface TenantManagementData {
  tenants: TenantData[];
  summary: TenantSummary;
}

export async function getTenantManagementData(): Promise<TenantManagementData> {
  try {
    const stores = await prisma.store.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        precinct: true,
        category: true,
        unitCode: true,
        audits: {
          where: { status: "SUBMITTED" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    const tenants: TenantData[] = stores.map((store) => {
      // Simulate compliance score for now (will be calculated from checklist items later)
      const hasAudits = store.audits.length > 0;
      const compliancePercent = hasAudits ? Math.floor(Math.random() * 40) + 60 : 0;
      const riskScore = compliancePercent < 70 ? 85 : compliancePercent < 85 ? 60 : 30;
      const riskLabel = riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low";

      return {
        id: store.id,
        name: store.name,
        precinct: store.precinct,
        category: store.category,
        unitCode: store.unitCode,
        compliancePercent,
        riskScore,
        riskLabel,
        expiringCertCount: 0, // TODO: Implement when certifications table exists
        expiredCertCount: 0,
      };
    });

    const summary: TenantSummary = {
      total: tenants.length,
      nonCompliant: tenants.filter((t) => t.compliancePercent < 85).length,
      highRisk: tenants.filter((t) => t.riskLabel === "High").length,
      expiringCerts: tenants.reduce((sum, t) => sum + t.expiringCertCount, 0),
    };

    return { tenants, summary };
  } catch (error) {
    console.error("Error fetching tenant management data:", error);
    return { tenants: [], summary: { total: 0, nonCompliant: 0, highRisk: 0, expiringCerts: 0 } };
  }
}
