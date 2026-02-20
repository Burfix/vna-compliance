import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  
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
      storeCount: await prisma.store.count(),
      userCount: await prisma.user.count(),
      auditCount: await prisma.audit.count(),
    },
    cookies: {
      // This will be empty in API route, but helps debug
      sessionCookieExpected: ["authjs.session-token", "__Secure-authjs.session-token"],
    },
  };

  return NextResponse.json(diagnostics, { status: 200 });
}
