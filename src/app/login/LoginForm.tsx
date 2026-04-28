"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "./actions";

// NextAuth redirects to /login?error=CredentialsSignin on failed auth.
// This inner component reads that param so the error is always visible.
function LoginFormInner() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [error, setError] = useState(
    urlError ? "User not found. Contact your compliance administrator." : ""
  );
  const [loading, setLoading] = useState(false);

  // Sync URL error in case the component mounts after the param is already set
  useEffect(() => {
    if (urlError) {
      setError("User not found. Contact your compliance administrator.");
    }
  }, [urlError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      // If no result, loginAction threw a redirect — do nothing (page will navigate)
    } catch {
      // Re-thrown redirect or unexpected error — let Next.js handle the navigation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="username"
          name="username"
          type="email"
          required
          autoComplete="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <div className="text-center">
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Forgot password?
        </Link>
      </div>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
      </div>
    }>
      <LoginFormInner />
    </Suspense>
  );
}
