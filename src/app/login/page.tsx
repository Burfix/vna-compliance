import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();

  // If already logged in, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600 mb-6">
            Sign in to access your dashboard
          </p>
          <LoginForm />
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
