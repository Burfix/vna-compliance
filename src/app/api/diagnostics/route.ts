import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  
  let databaseConnected = false;
  let storeCount = 0;
  let certCount = 0;
  
  try {
    storeCount = await prisma.store.count();
    certCount = await prisma.certification.count();
    databaseConnected = true;
  } catch (error) {
    console.error("Database connection failed:", error);
  }
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      demoMode: process.env.DEMO_MODE === "true",
      authSecretPresent: !!process.env.AUTH_SECRET,
      databaseUrlPresent: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
    },
    auth: {
      isAuthenticated: !!session,
      user: session?.user ? {
        id: session.user.id,
        username: session.user.username,
        role: session.user.role,
      } : null,
    },
    database: {
      databaseConnected,
      storeCount,
      certCount,
      userCount: databaseConnected ? await prisma.user.count() : 0,
      auditCount: databaseConnected ? await prisma.audit.count() : 0,
    },
    cookies: {
      sessionCookieExpected: ["authjs.session-token", "__Secure-authjs.session-token"],
    },
  };

  return NextResponse.json(diagnostics, { status: 200 });
}
