import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo users
  const manager = await prisma.user.upsert({
    where: { username: "sarah" },
    update: {},
    create: {
      username: "sarah",
      name: "Sarah Johnson",
      role: "ADMIN",
      active: true,
    },
  });

  const officer = await prisma.user.upsert({
    where: { username: "john" },
    update: {},
    create: {
      username: "john",
      name: "John Davis",
      role: "OFFICER",
      active: true,
    },
  });

  console.log("✅ Created users:", { manager: manager.username, officer: officer.username });

  // Create V&A Waterfront tenants
  const tenants = [
    // Silo District
    { id: "tenant-sd-1", name: "Si Cantina Sociale", unitCode: "SD-101", precinct: "Silo District", category: "FB" as const },
    { id: "tenant-sd-2", name: "The Silo Rooftop", unitCode: "SD-201", precinct: "Silo District", category: "FB" as const },
    { id: "tenant-sd-3", name: "Zeitz MOCAA Gallery Shop", unitCode: "SD-105", precinct: "Silo District", category: "RETAIL" as const },
    
    // Quay / Harbor
    { id: "tenant-qh-1", name: "Time Out Market", unitCode: "QH-301", precinct: "Quay / Harbor", category: "FB" as const },
    { id: "tenant-qh-2", name: "Harbor Fish Market", unitCode: "QH-102", precinct: "Quay / Harbor", category: "FB" as const },
    { id: "tenant-qh-3", name: "Boat Tours & Charters", unitCode: "QH-50", precinct: "Quay / Harbor", category: "SERVICES" as const },
    
    // Victoria Wharf
    { id: "tenant-vw-1", name: "Woolworths Food", unitCode: "VW-201", precinct: "Victoria Wharf", category: "RETAIL" as const },
    { id: "tenant-vw-2", name: "Victoria Wharf Food Court", unitCode: "VW-FC01", precinct: "Victoria Wharf", category: "FB" as const },
    { id: "tenant-vw-3", name: "Edgars Department Store", unitCode: "VW-150", precinct: "Victoria Wharf", category: "RETAIL" as const },
    { id: "tenant-vw-4", name: "CNA Bookstore", unitCode: "VW-78", precinct: "Victoria Wharf", category: "RETAIL" as const },
    
    // Alfred Mall
    { id: "tenant-am-1", name: "Cape Union Mart", unitCode: "AM-45", precinct: "Alfred Mall", category: "RETAIL" as const },
    { id: "tenant-am-2", name: "Clicks Pharmacy", unitCode: "AM-23", precinct: "Alfred Mall", category: "SERVICES" as const },
    { id: "tenant-am-3", name: "Alfred Cafe", unitCode: "AM-12", precinct: "Alfred Mall", category: "FB" as const },
    
    // Watershed
    { id: "tenant-ws-1", name: "African Craft Market", unitCode: "WS-10", precinct: "Watershed", category: "RETAIL" as const },
    { id: "tenant-ws-2", name: "Watershed Design Studio", unitCode: "WS-25", precinct: "Watershed", category: "RETAIL" as const },
    
    // Clock Tower
    { id: "tenant-ct-1", name: "Clock Tower Info Center", unitCode: "CT-01", precinct: "Clock Tower", category: "SERVICES" as const },
    { id: "tenant-ct-2", name: "Tower Gifts & Souvenirs", unitCode: "CT-15", precinct: "Clock Tower", category: "RETAIL" as const },
    
    // Pierhead
    { id: "tenant-ph-1", name: "Pierhead Craft Beer Garden", unitCode: "PH-30", precinct: "Pierhead", category: "FB" as const },
    { id: "tenant-ph-2", name: "Waterfront Souvenirs", unitCode: "PH-12", precinct: "Pierhead", category: "RETAIL" as const },
    
    // Portswood Ridge
    { id: "tenant-pr-1", name: "Ridge Fitness Center", unitCode: "PR-101", precinct: "Portswood Ridge", category: "SERVICES" as const },
  ];

  for (const tenant of tenants) {
    await prisma.store.upsert({
      where: { id: tenant.id },
      update: {},
      create: {
        id: tenant.id,
        name: tenant.name,
        unitCode: tenant.unitCode,
        precinct: tenant.precinct,
        category: tenant.category,
        active: true,
      },
    });
  }

  console.log(`✅ Created ${tenants.length} V&A Waterfront tenants`);

  // Create audit templates
  const templates = [
    {
      id: "template-fb-standard",
      name: "F&B Standard Compliance Check",
      description: "Monthly compliance audit covering food safety, hygiene, and kitchen operations",
    },
    {
      id: "template-retail-ohs",
      name: "Retail Safety & OHS",
      description: "Occupational health and safety inspection for retail environments",
    },
    {
      id: "template-late-night",
      name: "Late-Night Venue Compliance",
      description: "Extended hours venue compliance including noise, security, and patron safety",
    },
  ];

  for (const template of templates) {
    await prisma.auditTemplate.upsert({
      where: { id: template.id },
      update: {},
      create: {
        id: template.id,
        name: template.name,
        description: template.description,
        active: true,
      },
    });
  }

  console.log(`✅ Created ${templates.length} audit templates`);

  console.log("🎉 Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
