import { prisma } from "./db";

const REQUIRED_CERTS_BASE = [
  "Fire Safety Certificate",
  "Certificate of Occupancy",
  "Electrical Compliance (COC)",
  "Public Liability Insurance",
  "COID / Workman's Comp",
];

const REQUIRED_CERTS_FB = [
  ...REQUIRED_CERTS_BASE,
  "Health & Hygiene",
  "Gas Compliance",
];

export interface StoreWithCompliance {
  id: string;
  code: string;
  slug: string;
  name: string;
  precinct: string;
  category: string;
  unitCode: string;
  complianceScore: number;
  validCount: number;
  expiredCount: number;
  expiringSoonCount: number;
  missingCount: number;
}

export interface StoreDetail {
  id: string;
  code: string;
  slug: string;
  name: string;
  precinct: string;
  category: string;
  unitCode: string;
  certifications: Certification[];
}

export interface Certification {
  id: string;
  type: string;
  status: string;
  issuedAt: Date | null;
  expiresAt: Date | null;
  referenceNo: string | null;
  notes: string | null;
}

function isExpiringSoon(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return expiresAt <= thirtyDaysFromNow && expiresAt > now;
}

export async function getStores(): Promise<StoreWithCompliance[]> {
  const stores = await prisma.store.findMany({
    where: { active: true },
    include: {
      certifications: true,
    },
    orderBy: { name: "asc" },
  });

  return stores.map((store) => {
    const requiredCerts =
      store.category === "FB" ? REQUIRED_CERTS_FB : REQUIRED_CERTS_BASE;

    const validCount = store.certifications.filter(
      (c) => c.status === "VALID" && !isExpiringSoon(c.expiresAt)
    ).length;

    const expiredCount = store.certifications.filter(
      (c) => c.status === "EXPIRED"
    ).length;

    const expiringSoonCount = store.certifications.filter(
      (c) => c.status === "VALID" && isExpiringSoon(c.expiresAt)
    ).length;

    const missingCount = store.certifications.filter(
      (c) => c.status === "MISSING"
    ).length;

    // Count how many required certs are valid
    const validRequired = requiredCerts.filter((reqCert) => {
      const cert = store.certifications.find((c) => c.type === reqCert);
      return cert && cert.status === "VALID" && !isExpiringSoon(cert.expiresAt);
    }).length;

    const complianceScore = Math.round(
      (validRequired / requiredCerts.length) * 100
    );

    return {
      id: store.id,
      code: store.code,
      slug: store.slug,
      name: store.name,
      precinct: store.precinct,
      category: store.category,
      unitCode: store.unitCode,
      complianceScore,
      validCount,
      expiredCount,
      expiringSoonCount,
      missingCount,
    };
  });
}

export async function getStoreBySlug(
  slug: string
): Promise<StoreDetail | null> {
  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      certifications: {
        orderBy: { expiresAt: "asc" },
      },
    },
  });

  if (!store) return null;

  return {
    id: store.id,
    code: store.code,
    slug: store.slug,
    name: store.name,
    precinct: store.precinct,
    category: store.category,
    unitCode: store.unitCode,
    certifications: store.certifications.map((c) => ({
      id: c.id,
      type: c.type,
      status: c.status,
      issuedAt: c.issuedAt,
      expiresAt: c.expiresAt,
      referenceNo: c.referenceNo,
      notes: c.notes,
    })),
  };
}
