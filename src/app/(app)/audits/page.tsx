import Link from "next/link";

export default function AuditsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audits</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all audits
          </p>
        </div>
        <Link
          href="/audits/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Start New Audit
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Audit List Coming Soon</h3>
        <p className="text-sm text-gray-600 mb-6">
          Full audit browsing and filtering functionality will be implemented next.
        </p>
        <Link
          href="/audits/new"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Start Your First Audit
        </Link>
      </div>
    </div>
  );
}
