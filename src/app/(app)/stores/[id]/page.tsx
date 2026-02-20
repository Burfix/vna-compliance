import { getStoreBySlug } from "@/lib/stores";
import Link from "next/link";

// Force dynamic rendering - no static generation
export const dynamic = "force-dynamic";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  
  const store = await getStoreBySlug(slug);

  if (!store) {
    return (
      <div className="max-w-4xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Store not found</h1>
          <Link href="/stores" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Stores
          </Link>
        </div>
      </div>
    );
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
              <span className={`text-sm px-3 py-1 rounded-full border ${categoryColors[store.category]}`}>
                {categoryLabels[store.category]}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Certifications</h2>
        {store.certifications.length === 0 ? (
          <p className="text-gray-500">No certifications found</p>
        ) : (
          <div className="space-y-3">
            {store.certifications.map((cert) => (
              <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{cert.type}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[cert.status]}`}>
                        {cert.status}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {cert.referenceNo && (
                        <div>Ref: {cert.referenceNo}</div>
                      )}
                      {cert.issuedAt && (
                        <div>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</div>
                      )}
                      {cert.expiresAt && (
                        <div>Expires: {new Date(cert.expiresAt).toLocaleDateString()}</div>
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

