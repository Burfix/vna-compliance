import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Lists all stores with their IDs so we know what valid IDs look like.
 * GET /api/debug-store
 */
export async function GET() {
  try {
    const { prisma } = await import("@/lib/db");

    const stores = await prisma.store.findMany({
      where: { active: true },
      select: { id: true, slug: true, code: true, name: true },
      orderBy: { name: "asc" },
      take: 50,
    });

    return NextResponse.json({
      status: "OK",
      count: stores.length,
      stores: stores.map(s => ({
        id: s.id,
        slug: s.slug,
        code: s.code,
        name: s.name,
        detailUrl: `/stores/${s.id}`,
        debugUrl: `/api/debug-store/${s.id}`,
      })),
      sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({
      status: "DB_ERROR",
      error: msg.slice(0, 300),
    }, { status: 500 });
  }
}
