"use server";

import { prisma } from "@/lib/db";
import type { Category, CertificationType } from "@prisma/client";

export interface CertificationData {
  id: string;
  name: string;
  type: CertificationType;
  expiryDate: string;
  status: "VALID" | "EXPIRING_SOON" | "EXPIRED";
  isMandatory: boolean;
  issuer?: string;
}

export interface StoreDetailData {
  id: string;
  name: string;
  unitCode: string;
  precinct: string;
  category: Category;
  certifications: CertificationData[];
  certificationSummary: {
    totalValid: number;
    expiredCount: number;
    expiringSoonCount: number;
    riskAdjustment: number;
  };
}

function calculateCertificationStatus(expiryDate: Date): "VALID" | "EXPIRING_SOON" | "EXPIRED" {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return "EXPIRED";
  if (daysUntilExpiry <= 30) return "EXPIRING_SOON";
  return "VALID";
}

export async function getStoreDetail(id: string): Promise<StoreDetailData | null> {
  try {
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        certifications: {
          orderBy: { expiryDate: "asc" },
        },
      },
    });

    if (!store) return null;

    const certifications: CertificationData[] = store.certifications.map((cert) => ({
      id: cert.id,
      name: cert.name,
      type: cert.type,
      expiryDate: cert.expiryDate.toISOString(),
      status: calculateCertificationStatus(cert.expiryDate),
      isMandatory: cert.isMandatory,
      issuer: cert.issuer || undefined,
    }));

    // Calculate summary
    const totalValid = certifications.filter((c) => c.status === "VALID").length;
    const expiredCount = certifications.filter((c) => c.status === "EXPIRED").length;
    const expiringSoonCount = certifications.filter((c) => c.status === "EXPIRING_SOON").length;

    // Calculate risk adjustment
    let riskAdjustment = 0;
    riskAdjustment += expiredCount * 10; // Expired: +10 each
    riskAdjustment += expiringSoonCount * 5; // Expiring soon: +5 each
    
    // Missing mandatory certifications
    const mandatoryCerts = certifications.filter((c) => c.isMandatory);
    const missingMandatory = mandatoryCerts.filter((c) => c.status === "EXPIRED").length;
    riskAdjustment += missingMandatory * 15; // Missing mandatory: +15 each

    return {
      id: store.id,
      name: store.name,
      unitCode: store.unitCode,
      precinct: store.precinct,
      category: store.category,
      certifications,
      certificationSummary: {
        totalValid,
        expiredCount,
        expiringSoonCount,
        riskAdjustment,
      },
    };
  } catch (error) {
    console.error("Error fetching store detail:", error);
    return null;
  }
}
