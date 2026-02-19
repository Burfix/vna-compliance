"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isForbidden = error.message.includes("Forbidden");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          {isForbidden ? "403 - Forbidden" : "Error"}
        </h1>
        <p className="text-gray-700 mb-6">
          {isForbidden
            ? "You don't have permission to access this resource."
            : error.message || "Something went wrong!"}
        </p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
