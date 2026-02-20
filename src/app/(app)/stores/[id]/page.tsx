import { getEnv } from "@/lib/env";
import { getStoreDetail } from "./actions";
import CertificationPanel from "./CertificationPanel";
import Link from "next/link";
import { mockStores } from "@/lib/mock";
import type { StoreDetailData, CertificationData } from "./actions";

// Force dynamic rendering - no static generation
export const dynamic = "force-dynamic";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const env = getEnv();

  console.log(`[StoreDetailPage] id=${id}, MOCK_MODE=${env.MOCK_MODE}`);

  let storeData: StoreDetailData | null;

  if (env.MOCK_MODE) {
    // Generate mock data
    const mockStore = mockStores.find((s) => s.id === id);
    if (!mockStore) {
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

    // Generate mock certifications
    const mockCertifications: CertificationData[] = [
      {
        id: "cert-1",
        name: "Fire Safety Certificate",
        type: "FIRE",
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: "VALID",
        isMandatory: true,
        issuer: "Cape Town Fire Department",
      },
      {
        id: "cert-2",
        name: "Public Liability Insurance",
        type: "INSURANCE",
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: "EXPIRING_SOON",
        isMandatory: true,
        issuer: "Santam Insurance",
      },
      {
        id: "cert-3",
        name: "Electrical Compliance",
        type: "ELECTRICAL",
        expiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: "EXPIRED",
        isMandatory: false,
        issuer: "Certified Electricians SA",
      },
      {
        id: "cert-4",
        name: "Food Safety Certificate",
        type: "FOOD_SAFETY",
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        status: "VALID",
        isMandatory: mockStore.category === "FB",
        issuer: "Department of Health",
      },
      {
        id: "cert-5",
        name: "OHS Compliance",
        type: "OHS",
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: "VALID",
        isMandatory: true,
        issuer: "Department of Labour",
      },
    ];

    const totalValid = mockCertifications.filter((c) => c.status === "VALID").length;
    const expiredCount = mockCertifications.filter((c) => c.status === "EXPIRED").length;
    const expiringSoonCount = mockCertifications.filter((c) => c.status === "EXPIRING_SOON").length;

    // Calculate risk
    let riskAdjustment = 0;
    riskAdjustment += expiredCount * 10;
    riskAdjustment += expiringSoonCount * 5;
    const missingMandatory = mockCertifications.filter(
      (c) => c.isMandatory && c.status === "EXPIRED"
    ).length;
    riskAdjustment += missingMandatory * 15;

    storeData = {
      id: mockStore.id,
      name: mockStore.name,
      unitCode: mockStore.unitCode,
      precinct: mockStore.precinct,
      category: mockStore.category,
      certifications: mockCertifications,
      certificationSummary: {
        totalValid,
        expiredCount,
        expiringSoonCount,
        riskAdjustment,
      },
    };
  } else {
    storeData = await getStoreDetail(id);
  }

  if (!storeData) {
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

  return (
    <div className="max-w-6xl space-y-6">
      {/* Back Button */}
      <Link
        href="/stores"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
      >
        <span>←</span>
        <span>Back to Stores</span>
      </Link>

      {/* Store Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{storeData.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                {storeData.unitCode}
              </span>
              <span className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                {storeData.precinct}
              </span>
              <span className={`text-sm px-3 py-1 rounded-full border ${categoryColors[storeData.category]}`}>
                {categoryLabels[storeData.category]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Certification Panel */}
      <CertificationPanel data={storeData} />
    </div>
  );
}
