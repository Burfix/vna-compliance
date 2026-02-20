import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function normalizeSlug(code: string): string {
  return `tenant-${code.toLowerCase()}`;
}

const stores = [
  { name: "Si Cantina Sociale", code: "SD-101", category: "FB", precinct: "Silo District" },
  { name: "The Silo Rooftop", code: "SD-201", category: "FB", precinct: "Silo District" },
  { name: "Zeitz MOCAA Gallery Shop", code: "SD-105", category: "RETAIL", precinct: "Silo District" },
  { name: "Time Out Market", code: "QH-301", category: "FB", precinct: "Quay / Harbor" },
  { name: "Harbor Fish Market", code: "QH-102", category: "FB", precinct: "Quay / Harbor" },
  { name: "Boat Tours & Charters", code: "QH-50", category: "SERVICES", precinct: "Quay / Harbor" },
  { name: "Woolworths Food", code: "VW-201", category: "RETAIL", precinct: "Victoria Wharf" },
  { name: "Victoria Wharf Food Court", code: "VW-801", category: "FB", precinct: "Victoria Wharf" },
  { name: "Edgars Department Store", code: "VW-10", category: "RETAIL", precinct: "Victoria Wharf" },
  { name: "CNA Bookstore", code: "VW-78", category: "RETAIL", precinct: "Victoria Wharf" },
  { name: "Cape Union Mart", code: "AM-65", category: "RETAIL", precinct: "Alfred Mall" },
  { name: "Clicks Pharmacy", code: "AM-23", category: "SERVICES", precinct: "Alfred Mall" },
  { name: "Alfred Cafe", code: "AM-22", category: "FB", precinct: "Alfred Mall" },
  { name: "African Craft Market", code: "WS-10", category: "RETAIL", precinct: "Watershed" },
  { name: "Watershed Design Studio", code: "WS-95", category: "RETAIL", precinct: "Watershed" },
  { name: "Clock Tower Info Center", code: "CT-07", category: "SERVICES", precinct: "Clock Tower" },
  { name: "Tower Gift & Souvenirs", code: "CT-65", category: "RETAIL", precinct: "Clock Tower" },
  { name: "Pierhead Craft Beer Garden", code: "PH-20", category: "FB", precinct: "Pierhead" },
  { name: "Waterfront Souvenirs", code: "PH-12", category: "RETAIL", precinct: "Pierhead" },
  { name: "Ridge Fitness Center", code: "PR-101", category: "SERVICES", precinct: "Precinct" },
  { name: "SiCantina Sociale (Kiosk/Annex)", code: "SD-401", category: "FB", precinct: "Silo District" },
  { name: "Woolworths Food (Express)", code: "VW-812", category: "RETAIL", precinct: "Victoria Wharf" },
];

const certificationTypes = [
  "Fire Safety Certificate",
  "Certificate of Occupancy",
  "Health & Hygiene",
  "Electrical Compliance (COC)",
  "Gas Compliance",
  "COID / Workman's Comp",
  "Public Liability Insurance",
];

function randomDate(minDays: number, maxDays: number): Date {
  const now = new Date();
  const days = minDays + Math.random() * (maxDays - minDays);
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

function generateCertifications(storeId: string, category: string) {
  const certs: Array<{
    storeId: string;
    type: string;
    status: string;
    issuedAt: Date | null;
    expiresAt: Date | null;
    referenceNo: string | null;
    notes: string | null;
  }> = [];
  const certCount = 3 + Math.floor(Math.random() * 4); // 3-6 certs

  const availableTypes = [...certificationTypes];
  if (category !== "FB") {
    const fbIndex = availableTypes.indexOf("Gas Compliance");
    if (fbIndex > -1) availableTypes.splice(fbIndex, 1);
    const healthIndex = availableTypes.indexOf("Health & Hygiene");
    if (healthIndex > -1) availableTypes.splice(healthIndex, 1);
  }

  const selectedTypes = availableTypes
    .sort(() => Math.random() - 0.5)
    .slice(0, certCount);

  selectedTypes.forEach((type) => {
    const rand = Math.random();
    let status: string;
    let issuedAt: Date | null;
    let expiresAt: Date | null;

    if (rand < 0.5) {
      status = "VALID";
      issuedAt = randomDate(-365, -60);
      expiresAt = randomDate(60, 360);
    } else if (rand < 0.7) {
      status = "VALID";
      issuedAt = randomDate(-365, -60);
      expiresAt = randomDate(1, 30);
    } else if (rand < 0.9) {
      status = "EXPIRED";
      issuedAt = randomDate(-545, -180);
      expiresAt = randomDate(-180, -1);
    } else {
      status = "MISSING";
      issuedAt = null;
      expiresAt = null;
    }

    certs.push({
      storeId,
      type,
      status,
      issuedAt,
      expiresAt,
      referenceNo: status !== "MISSING" ? `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : null,
      notes: null,
    });
  });

  return certs;
}

export async function GET() {
  try {
    const results = {
      stores: [] as string[],
      certifications: 0,
      users: [] as string[],
    };

    // Seed stores
    for (const storeData of stores) {
      const store = await prisma.store.upsert({
        where: { code: storeData.code },
        update: {
          name: storeData.name,
          slug: normalizeSlug(storeData.code),
          precinct: storeData.precinct,
          category: storeData.category as any,
          unitCode: storeData.code,
        },
        create: {
          code: storeData.code,
          slug: normalizeSlug(storeData.code),
          name: storeData.name,
          unitCode: storeData.code,
          precinct: storeData.precinct,
          category: storeData.category as any,
          active: true,
        },
      });
      results.stores.push(store.name);
    }

    // Seed certifications
    const allStores = await prisma.store.findMany();
    for (const store of allStores) {
      const certs = generateCertifications(store.id, store.category);
      for (const cert of certs) {
        await prisma.certification.create({ data: cert });
        results.certifications++;
      }
    }

    // Seed users
    const sarah = await prisma.user.upsert({
      where: { username: "sarah" },
      update: {},
      create: {
        username: "sarah",
        name: "Sarah Johnson",
        role: "ADMIN",
        active: true,
      },
    });

    const john = await prisma.user.upsert({
      where: { username: "john" },
      update: {},
      create: {
        username: "john",
        name: "John Davis",
        role: "OFFICER",
        active: true,
      },
    });

    results.users.push(sarah.username, john.username);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      results,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
