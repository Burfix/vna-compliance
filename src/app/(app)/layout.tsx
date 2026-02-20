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

  console.log("[AppLayout] session exists:", !!session?.user, "username:", session?.user?.username, "DEMO_MODE:", env.MOCK_MODE);

  // Use session user or mock user in MOCK_MODE
  const user = session?.user || (env.MOCK_MODE ? { name: "Demo Manager", role: "ADMIN" as const } : null);

  // If no user in production and not in DEMO_MODE, middleware should have redirected
  // But if we got here, we should still try to render (middleware might allow it)
  // Only show error if explicitly no user AND no demo mode
  if (!user && !env.MOCK_MODE) {
    console.error("[AppLayout] NO USER AND NO MOCK_MODE - but middleware allowed access, proceeding");
    // Don't block - middleware already handles redirects
    // If we got here, it means the request passed middleware checks
  }

  console.log("[AppLayout] Rendering with user:", user?.name, "user object:", !!user);

  // If no user in production, the content won't render anyway
  const displayUser = user || { name: "User", role: "USER" as const };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    ...(displayUser.role === "ADMIN"
      ? [{ name: "Executive", href: "/exec", icon: "🏛️" }]
      : []),
    { name: "Audits", href: "/audits", icon: "📋" },
    { name: "Tenants", href: "/stores", icon: "🏪" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
  ];

  const getRoleBadgeColor = (role: string) => {
    return role === "ADMIN" 
      ? "bg-purple-100 text-purple-800 border-purple-200" 
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
              {displayUser.name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {displayUser.name || "User"}
              </p>
              <p className="text-xs text-gray-500">{displayUser.role}</p>
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
