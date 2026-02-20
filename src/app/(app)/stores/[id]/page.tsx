import { getStoreById } from "@/lib/stores";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StoreDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  console.log("[StoreDetail] Received id param:", JSON.stringify(id));

  let store;
  let dbError: string | null = null;
  try {
    store = await getStoreById(id);
    console.log("[StoreDetail] DB result:", store ? `found: ${store.name}` : "null");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[StoreDetail] DB ERROR:", msg);
    dbError = msg;
  }

  if (dbError) {
    return (
      <div style={{ padding: 40 }}>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 999999,
            background: "red",
            color: "white",
            fontWeight: 900,
            fontSize: 18,
            padding: 14,
            textAlign: "center",
            borderBottom: "4px solid darkred",
          }}
        >
          DATABASE ERROR on /stores/[id] — id: {id} — {dbError.slice(0, 120)}
        </div>
        <div style={{ height: 70 }} />
        <h1>Database Error</h1>
        <p>Could not load store. Error: {dbError.slice(0, 200)}</p>
        <Link href="/stores">← Back to Stores</Link>
      </div>
    );
  }

  if (!store) {
    notFound();
  }

  const categoryLabels: Record<string, string> = {
    FB: "F&B",
    RETAIL: "Retail",
    SERVICES: "Services",
  };

  const categoryColors: Record<string, string> = {
    FB: "bg-orange-100 text-orange-800 border-orange-200",
    RETAIL: "bg-blue-100 text-blue-800 border-blue-200",
    SERVICES: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const statusColors: Record<string, string> = {
    VALID: "bg-green-100 text-green-800",
    EXPIRED: "bg-red-100 text-red-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    MISSING: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999999,
          background: "yellow",
          color: "black",
          fontWeight: 900,
          fontSize: 16,
          padding: 12,
          textAlign: "center",
          borderBottom: "4px solid orange",
        }}
      >
        STORE DETAIL LOADED — id: {id} — name: {store.name} — build:{" "}
        {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local"}
      </div>
      <div style={{ height: 60 }} />

      <Link
        href="/stores"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
      >
        <span>←</span>
        <span>Back to Stores</span>
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                {store.code}
              </span>
              <span className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                {store.precinct}
              </span>
              <span
                className={`text-sm px-3 py-1 rounded-full border ${
                  categoryColors[store.category] ?? ""
                }`}
              >
                {categoryLabels[store.category] ?? store.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
          <Link
            href={`/audits/new?store=${store.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Audit
          </Link>
        </div>
        {store.certifications.length === 0 ? (
          <p className="text-gray-500">No certifications found</p>
        ) : (
          <div className="space-y-3">
            {store.certifications.map((cert) => (
              <div
                key={cert.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {cert.type}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          statusColors[cert.status] ?? ""
                        }`}
                      >
                        {cert.status}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {cert.referenceNo && <div>Ref: {cert.referenceNo}</div>}
                      {cert.issuedAt && (
                        <div>
                          Issued:{" "}
                          {new Date(cert.issuedAt).toLocaleDateString()}
                        </div>
                      )}
                      {cert.expiresAt && (
                        <div>
                          Expires:{" "}
                          {new Date(cert.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                      {cert.notes && (
                        <div className="text-gray-500 italic">{cert.notes}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

