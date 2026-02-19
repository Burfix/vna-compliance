import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getEnv } from "@/lib/env";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const env = getEnv();

  // Redirect to login if not authenticated and not in mock mode
  if (!session?.user && !env.MOCK_MODE) {
    redirect("/login");
  }

  // Use mock user if in mock mode and no session
  const user = session?.user || (env.MOCK_MODE ? { name: "Demo Manager", role: "ADMIN" } : null);

  if (!user) {
    redirect("/login");
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
              {user.name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
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
            <span className={`px-2.5 py-1 text-xs font-medium border rounded ${getRoleBadgeColor(user.role)}`}>
              {user.role}
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
