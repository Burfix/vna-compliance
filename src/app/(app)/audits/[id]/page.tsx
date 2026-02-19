import { getEnv } from "@/lib/env";
import { getMockAuditById } from "@/lib/mock";
import AuditDetailClient from "./AuditDetailClient";

export default async function AuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const env = getEnv();

  // In mock mode, use mock data
  // In real mode, fetch from database
  const rawAudit = env.MOCK_MODE ? getMockAuditById(id) : await getRealAudit(id);

  if (!rawAudit) {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900">Audit Not Found</h2>
          <p className="mt-2 text-sm text-red-700">
            The audit with ID {id} could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Add score field if it doesn't exist (for real DB data)
  const audit = {
    ...rawAudit,
    score: 'score' in rawAudit ? rawAudit.score : null,
  };

  return (
    <div className="max-w-4xl">
      <AuditDetailClient audit={audit} isMockMode={env.MOCK_MODE} />
    </div>
  );
}

// Placeholder function for real data fetching
async function getRealAudit(id: string) {
  // TODO: Implement real database query
  try {
    const { getAuditById } = await import("@/app/(app)/audits/actions");
    return await getAuditById(id);
  } catch {
    return null;
  }
}
