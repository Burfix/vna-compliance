"use client";

import { useState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      // Redirect throws an error, which is expected
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        return;
      }
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your username"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
          <p className="font-semibold mb-1">Demo Users:</p>
          <p>• sarah (ADMIN)</p>
          <p>• john (OFFICER)</p>
        </div>
      )}
    </form>
  );
}
