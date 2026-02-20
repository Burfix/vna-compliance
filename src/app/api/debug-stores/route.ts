import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      select: { id: true, name: true, slug: true, code: true },
      take: 5,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      ok: true,
      count: stores.length,
      stores,
      note: "These are the actual DB IDs. Store detail URLs should be /stores/{id}",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
