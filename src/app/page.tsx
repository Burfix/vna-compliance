import Link from "next/link";
import { getEnv } from "@/lib/env";

export default function HomePage() {
  const env = getEnv();
  const isDemoMode = env.DEMO_MODE;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white shadow-2xl rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
            Operational Compliance Engine
          </h1>
          <p className="text-xl text-gray-600 mb-8 text-center">
            Streamline your audit and compliance workflows
          </p>

          {isDemoMode && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-sm font-semibold text-yellow-800 mb-3">
                🧪 Demo Mode Active
              </p>
              <div className="space-y-3">
                <form action="/api/auth/signin/credentials" method="post">
                  <input type="hidden" name="email" value="manager@demo.com" />
                  <input
                    type="hidden"
                    name="callbackUrl"
                    value="/dashboard"
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Login as Manager (ADMIN)
                  </button>
                </form>
                <form action="/api/auth/signin/credentials" method="post">
                  <input type="hidden" name="email" value="officer@demo.com" />
                  <input
                    type="hidden"
                    name="callbackUrl"
                    value="/dashboard"
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Login as Officer (AUDITOR)
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full px-6 py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Login
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Features
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">✓</span> Role-based access control
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Audit management
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Store tracking
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Template-based workflows
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
