import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSafeEnvInfo } from "@/lib/env";

export async function GET() {
  const startTime = Date.now();

  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    // Get safe environment info
    const envInfo = getSafeEnvInfo();

    return NextResponse.json({
      ok: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      db: {
        ok: true,
        latencyMs: dbLatency,
      },
      env: {
        nodeEnv: envInfo.nodeEnv,
        demoMode: envInfo.demoMode,
      },
    });
  } catch (error) {
    const dbLatency = Date.now() - startTime;

    return NextResponse.json(
      {
        ok: false,
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        db: {
          ok: false,
          latencyMs: dbLatency,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 503 }
    );
  }
}
