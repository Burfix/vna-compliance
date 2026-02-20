import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600 mb-6">
            The store you&apos;re looking for doesn&apos;t exist or has been removed.
            <br />
            <span className="text-sm text-gray-500">(Invalid ID or missing database record)</span>
          </p>
        </div>
        <Link 
          href="/stores" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>←</span>
          <span>Back to Stores</span>
        </Link>
      </div>
    </div>
  );
}
