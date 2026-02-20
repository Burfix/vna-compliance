import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export async function GET() {
  // Only allow in demo mode
  const env = getEnv();
  if (!env.DEMO_MODE) {
    return NextResponse.json(
      { error: "Seed endpoint is only available in DEMO_MODE" },
      { status: 403 }
    );
  }

  try {
    // Create demo users
    const manager = await prisma.user.upsert({
      where: { username: "sarah" },
      update: { active: true },
      create: {
        username: "sarah",
        name: "Sarah Johnson",
        role: "ADMIN",
        active: true,
      },
    });

    const officer = await prisma.user.upsert({
      where: { username: "john" },
      update: { active: true },
      create: {
        username: "john",
        name: "John Davis",
        role: "OFFICER",
        active: true,
      },
    });

    // Create stores
    const store1 = await prisma.store.upsert({
      where: { id: "store-1" },
      update: {},
      create: {
        id: "store-1",
        name: "Si Cantina Sociale",
        unitCode: "SILO-F01",
        precinct: "Silo District",
        category: "FB",
        active: true,
      },
    });

    const store2 = await prisma.store.upsert({
      where: { id: "store-2" },
      update: {},
      create: {
        id: "store-2",
        name: "Woolworths Food",
        unitCode: "VW-R12",
        precinct: "Victoria Wharf",
        category: "RETAIL",
        active: true,
      },
    });

    // Seed certifications for all stores
    console.log("🌱 Seeding certifications...");

    const stores = await prisma.store.findMany();
    
    const certificationTypes = [
      { type: "FIRE", name: "Fire Safety Certificate", issuer: "Cape Town Fire Department", mandatory: true },
      { type: "INSURANCE", name: "Public Liability Insurance", issuer: "Santam Insurance", mandatory: true },
      { type: "ELECTRICAL", name: "Electrical Compliance Certificate", issuer: "Certified Electricians SA", mandatory: false },
      { type: "OHS", name: "Occupational Health & Safety Compliance", issuer: "Department of Labour", mandatory: true },
      { type: "GAS", name: "Gas Safety Certificate", issuer: "SA Gas Safety", mandatory: false },
    ];

    let totalCertsCreated = 0;

    for (const store of stores) {
      // Food & Beverage stores get additional certification
      const certs = [...certificationTypes];
      if (store.category === "FB") {
        certs.push({
          type: "FOOD_SAFETY",
          name: "Food Safety Certificate",
          issuer: "Department of Health",
          mandatory: true,
        });
      }

      for (const cert of certs) {
        // Randomize expiry dates: -50 to 350 days from now
        const randomDays = Math.floor(Math.random() * 400) - 50;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + randomDays);

        try {
          await prisma.certification.upsert({
            where: {
              storeId_name: {
                storeId: store.id,
                name: cert.name,
              },
            },
            update: {},
            create: {
              storeId: store.id,
              name: cert.name,
              type: cert.type,
              expiryDate,
              isMandatory: cert.mandatory,
              issuer: cert.issuer,
            },
          });
          totalCertsCreated++;
        } catch (error) {
          console.error(`Failed to create ${cert.name} for ${store.name}`);
        }
      }
    }

    console.log(`✅ Created ${totalCertsCreated} certifications`);

    // Create audit template
    const template = await prisma.auditTemplate.upsert({
      where: { id: "template-standard-001" },
      update: {},
      create: {
        id: "template-standard-001",
        name: "F&B Standard Compliance Check",
        description: "General operational compliance checklist",
        active: true,
      },
    });

    // Count records
    const counts = {
      users: await prisma.user.count(),
      stores: await prisma.store.count(),
      certifications: await prisma.certification.count(),
      templates: await prisma.auditTemplate.count(),
      audits: await prisma.audit.count(),
    };

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      created: {
        users: [manager.username, officer.username],
        stores: [store1.name, store2.name],
        templates: [template.name],
      },
      counts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
