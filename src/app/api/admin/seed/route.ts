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
      where: { email: "manager@vna.com" },
      update: { active: true },
      create: {
        email: "manager@vna.com",
        name: "Sarah Johnson",
        role: "ADMIN",
        active: true,
      },
    });

    const officer = await prisma.user.upsert({
      where: { email: "officer@vna.com" },
      update: { active: true },
      create: {
        email: "officer@vna.com",
        name: "James Miller",
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
      templates: await prisma.auditTemplate.count(),
      audits: await prisma.audit.count(),
    };

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      created: {
        users: [manager.email, officer.email],
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
