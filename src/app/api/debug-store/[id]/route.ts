import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Debug endpoint: queries a store by ID directly via Prisma.
 * No auth, no layout, no middleware interference.
 * GET /api/debug-store/[id]
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { prisma } = await import("@/lib/db");

    const store = await prisma.store.findUnique({
      where: { id },
      include: { certifications: { take: 2 } },
    });

    if (!store) {
      // Also try finding by slug in case the id is actually a slug
      const bySlug = await prisma.store.findUnique({
        where: { slug: id },
        select: { id: true, slug: true, name: true },
      });

      return NextResponse.json({
        status: "NOT_FOUND",
        queriedId: id,
        foundBySlug: bySlug ?? null,
        hint: bySlug
          ? `This looks like a slug. Use id="${bySlug.id}" instead.`
          : "No store found with this id or slug.",
        sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
      }, { status: 404 });
    }

    return NextResponse.json({
      status: "FOUND",
      store: {
        id: store.id,
        slug: store.slug,
        code: store.code,
        name: store.name,
        precinct: store.precinct,
        category: store.category,
        certCount: store.certifications.length,
      },
      sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({
      status: "DB_ERROR",
      queriedId: id,
      error: msg.slice(0, 300),
      sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    }, { status: 500 });
  }
}
