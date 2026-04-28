import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600 mb-6 text-sm">
            Access to this platform is managed by your compliance administrator.
            If you cannot sign in, please contact them directly to reset your
            credentials.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              V&amp;A Waterfront Compliance Team
            </p>
            <p className="text-sm text-blue-800">
              Email:{" "}
              <a
                href="mailto:compliance@waterfront.co.za"
                className="underline hover:text-blue-900"
              >
                compliance@waterfront.co.za
              </a>
            </p>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            Include your email address and the name of your store in the
            message. Your administrator will reset your access within 1 business
            day.
          </p>

          <Link
            href="/login"
            className="block text-center text-sm text-blue-600 hover:text-blue-700 underline"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
