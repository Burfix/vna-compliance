import { getEnv } from "@/lib/env";
import { mockStores, mockTemplates } from "@/lib/mock";
import NewAuditForm from "./NewAuditForm";

export default async function NewAuditPage() {
  const env = getEnv();

  // In mock mode, use mock data
  // In real mode, fetch from database
  const stores = env.MOCK_MODE ? mockStores : await getRealStores();
  const templates = env.MOCK_MODE ? mockTemplates : await getRealTemplates();

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Start New Audit</h2>
        <p className="mt-2 text-sm text-gray-600">
          Select a store and audit template to begin a new compliance audit.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <NewAuditForm
          stores={stores}
          templates={templates}
          isMockMode={env.MOCK_MODE}
        />
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Getting Started</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Select the store you want to audit</li>
          <li>• Choose the appropriate audit template</li>
          <li>• Click &quot;Create Draft Audit&quot; to begin</li>
          <li>• You can save progress and submit the audit later</li>
        </ul>
      </div>
    </div>
  );
}

// Placeholder functions for real data fetching
async function getRealStores() {
  // TODO: Implement real database query
  const { getStoresForAudits } = await import("@/app/(app)/audits/actions");
  return getStoresForAudits();
}

async function getRealTemplates() {
  // TODO: Implement real database query
  const { getAuditTemplates } = await import("@/app/(app)/audits/actions");
  return getAuditTemplates();
}
