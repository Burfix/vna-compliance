import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("🔧 Starting migration and seed process...");

    // Check if Certification table exists by trying to count
    let tableExists = false;
    try {
      await prisma.certification.count();
      tableExists = true;
      console.log("✅ Certification table already exists");
    } catch (error) {
      console.log("📋 Certification table does not exist yet");
    }

    if (!tableExists) {
      return NextResponse.json({
        error: "Database migration required",
        message: "The Certification table doesn't exist. Please run 'npx prisma migrate deploy' from Vercel CLI or terminal.",
        tableExists: false,
      }, { status: 500 });
    }

    // Check if certifications already exist
    const existingCerts = await prisma.certification.count();
    if (existingCerts > 0) {
      return NextResponse.json({
        message: "Certifications already seeded",
        count: existingCerts,
        alreadySeeded: true,
      });
    }

    // Seed certifications
    console.log("🌱 Seeding certifications...");

    const stores = await prisma.store.findMany();
    
    if (stores.length === 0) {
      return NextResponse.json({
        error: "No stores found",
        message: "Please seed stores first by visiting /api/admin/seed",
      }, { status: 400 });
    }

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
          await prisma.certification.create({
            data: {
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
          console.error(`Failed to create ${cert.name} for ${store.name}:`, error);
        }
      }
    }

    console.log(`✅ Created ${totalCertsCreated} certifications across ${stores.length} stores`);

    return NextResponse.json({
      success: true,
      message: "Certifications seeded successfully",
      stats: {
        storesProcessed: stores.length,
        certificationsCreated: totalCertsCreated,
      },
    });

  } catch (error) {
    console.error("Migration/seed error:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        message: error instanceof Error ? error.message : "Unknown error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
