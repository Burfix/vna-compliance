import Link from "next/link";
import { auth } from "@/auth";
import { getEnv } from "@/lib/env";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const env = getEnv();

  // Use session user or mock user in MOCK_MODE
  const user = session?.user || (env.MOCK_MODE ? { name: "Demo Manager", role: "ADMIN" } : null);

  // Middleware handles redirect to login, so if we get here without a user in production, show error
  if (!user && !env.MOCK_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access this page.</p>
          <a href="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Audits", href: "/audits", icon: "📋" },
    { name: "Tenants", href: "/stores", icon: "🏪" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
  ];

  const getRoleBadgeColor = (role: string) => {
    return role === "ADMIN" 
      ? "bg-purple-100 text-purple-800 border-purple-200" 
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  // If no user in production, the content won't render anyway
  const displayUser = user || { name: "User", role: "USER" as const };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        {/* Logo/Title */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-lg font-semibold text-gray-900">
            Operational Compliance
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User info at bottom */}
        <div cldisplayUser.name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {displayUser.name || "User"}
              </p>
              <p className="text-xs text-gray-500">{displayUgray-900 truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-900">
            Operational Compliance Engine
          </h1>
          <div className="flex items-center gap-4">
            {env.MOCK_MODE && (
              <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 rounded">
                MOCK MODE
              </span>
            )}
            {env.DEMO_MODE && (
              <span className="px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 rounded">
                DEMO MODE
              </span>
            )}
            <span className={`px-2.5 py-1 text-xs font-medium border rounded ${getRoleBadgeColor(displayUser.role)}`}>
              {displayUser.role}
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
