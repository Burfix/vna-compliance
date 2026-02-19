#!/usr/bin/env node

/**
 * Environment Verification Script
 * Validates that all required environment variables are set correctly
 */

import { getEnv, getSafeEnvInfo } from "../src/lib/env.js";

console.log("🔍 Verifying environment configuration...\n");

try {
  const env = getEnv();
  const safeInfo = getSafeEnvInfo();

  console.log("✅ Environment validation passed!\n");
  console.log("📋 Configuration:");
  console.log(`   • Node Environment: ${safeInfo.nodeEnv}`);
  console.log(`   • Demo Mode: ${safeInfo.demoMode ? "ENABLED" : "DISABLED"}`);
  console.log(`   • Database URL: ${safeInfo.hasDatabaseUrl ? "✓ SET" : "✗ MISSING"}`);
  console.log(`   • Direct URL: ${safeInfo.hasDirectUrl ? "✓ SET" : "✗ MISSING"}`);
  console.log(`   • NextAuth Secret: ${safeInfo.hasNextAuthSecret ? "✓ SET" : "✗ MISSING"}`);
  console.log("");

  if (env.DEMO_MODE) {
    console.log("⚠️  Warning: DEMO_MODE is enabled. Set to 'false' in production.");
    console.log("");
  }

  console.log("✨ All environment variables are properly configured!");
  process.exit(0);
} catch (error) {
  console.error("❌ Environment verification failed!");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
