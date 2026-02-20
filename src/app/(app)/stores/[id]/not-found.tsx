import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div style={{ padding: 40 }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999999,
          background: "magenta",
          color: "white",
          fontWeight: 900,
          fontSize: 18,
          padding: 14,
          textAlign: "center",
          borderBottom: "4px solid darkmagenta",
        }}
      >
        STORE NOT FOUND — notFound() was triggered — this is /stores/[id]/not-found.tsx
      </div>
      <div style={{ height: 70 }} />
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <span style={{ fontSize: 36 }}>🚫</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Store Not Found</h1>
        <p className="text-gray-600 mb-2">
          The store ID in the URL does not match any record in the database.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          This means notFound() was called — the param was received but the DB lookup returned null.
        </p>
        <Link
          href="/stores"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          ← Back to Stores
        </Link>
      </div>
    </div>
  );
}
