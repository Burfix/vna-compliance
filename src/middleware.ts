import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/login",
    "/demo",
    "/api/auth",
    "/_next",
    "/favicon.ico",
  ];

  // Check if path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublicPath) {
    return; // Allow access
  }

  // For protected paths, check for authenticated user
  if (!req.auth?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname + req.nextUrl.search);
    return Response.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
