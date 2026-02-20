import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  
  // Pick random cert types
  const availableTypes = [...certificationTypes];
  if (category !== "FB") {
    // Remove Gas Compliance and Health & Hygiene for non-F&B
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
      // 50% valid (expires 60-360 days from now)
      status = "VALID";
      issuedAt = randomDate(-365, -60);
      expiresAt = randomDate(60, 360);
    } else if (rand < 0.7) {
      // 20% expiring soon (expires 1-30 days)
      status = "VALID";
      issuedAt = randomDate(-365, -60);
      expiresAt = randomDate(1, 30);
    } else if (rand < 0.9) {
      // 20% expired (expired 1-180 days ago)
      status = "EXPIRED";
      issuedAt = randomDate(-545, -180);
      expiresAt = randomDate(-180, -1);
    } else {
      // 10% missing
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

async function main() {
  console.log("🌱 Seeding database...");
  
  // Seed stores
  console.log("📦 Seeding 22 stores...");
  const createdStores = [];
  
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
    createdStores.push(store);
    console.log(`  ✓ ${store.name} (${store.code})`);
  }
  
  // Seed certifications
  console.log("📜 Seeding certifications...");
  let certCount = 0;
  
  for (const store of createdStores) {
    const certs = generateCertifications(store.id, store.category);
    
    for (const cert of certs) {
      await prisma.certification.create({
        data: cert,
      });
      certCount++;
    }
  }
  
  console.log(`  ✓ Created ${certCount} certifications`);
  
  // Seed users (if not exists)
  console.log("👤 Seeding users...");
  await prisma.user.upsert({
    where: { username: "sarah" },
    update: {},
    create: {
      username: "sarah",
      name: "Sarah Johnson",
      role: "ADMIN",
      active: true,
    },
  });
  
  await prisma.user.upsert({
    where: { username: "john" },
    update: {},
    create: {
      username: "john",
      name: "John Davis",
      role: "OFFICER",
      active: true,
    },
  });
  
  console.log("✅ Seeding complete!");
  console.log(`   - ${createdStores.length} stores`);
  console.log(`   - ${certCount} certifications`);
  console.log("   - 2 users");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
