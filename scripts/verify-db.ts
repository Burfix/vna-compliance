#!/usr/bin/env node

/**
 * Database Verification Script
 * Tests database connectivity and basic operations
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("🔍 Verifying database connection...\n");

async function verifyDatabase() {
  try {
    // Test 1: Basic connectivity
    console.log("Test 1: Basic connectivity...");
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;
    console.log(`✅ Connected successfully (${latency}ms)\n`);

    // Test 2: Check if migrations are applied
    console.log("Test 2: Checking database schema...");
    const tables = await prisma.$queryRaw<
      { tablename: string }[]
    >`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
    
    const requiredTables = ["users", "stores", "audit_templates", "audits"];
    const existingTables = tables.map((t) => t.tablename);
    
    const missingTables = requiredTables.filter(
      (table) => !existingTables.includes(table)
    );

    if (missingTables.length > 0) {
      console.log(`❌ Missing tables: ${missingTables.join(", ")}`);
      console.log("   Run: npm run db:migrate");
      process.exit(1);
    }

    console.log(`✅ All required tables exist\n`);

    // Test 3: Check for seed data
    console.log("Test 3: Checking seed data...");
    const userCount = await prisma.user.count();
    const storeCount = await prisma.store.count();
    const templateCount = await prisma.auditTemplate.count();

    console.log(`   • Users: ${userCount}`);
    console.log(`   • Stores: ${storeCount}`);
    console.log(`   • Templates: ${templateCount}`);

    if (userCount === 0 || storeCount === 0 || templateCount === 0) {
      console.log("⚠️  Warning: Database appears empty. Run: npm run db:seed");
    } else {
      console.log("✅ Seed data detected\n");
    }

    console.log("✨ Database verification complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database verification failed!");
    console.error(error instanceof Error ? error.message : String(error));
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Ensure PostgreSQL is running");
    console.error("   2. Check DATABASE_URL and DIRECT_URL in .env");
    console.error("   3. Verify database exists: psql -l | grep compliance_engine");
    console.error("   4. Run migrations: npm run db:migrate");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
