import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Edge-safe middleware. Imports from auth.config (no Prisma)
 * so the bundle stays under Vercel's 1MB Edge Function limit.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public path prefixes (NOT "/" — that matches everything!)
  const publicPrefixes = [
    "/login",
    "/demo",
    "/api/auth",
    "/api/debug",
    "/_next",
    "/favicon.ico",
    "/zz-debug",
    "/deploy-proof",
  ];

  // Exact match for root, prefix match for everything else
  const isPublicPath =
    pathname === "/" ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix));

  console.log(`[middleware] path=${pathname} public=${isPublicPath} authed=${!!req.auth?.user}`);

  if (isPublicPath) {
    return; // Allow access without auth
  }

  // Protected path — require authenticated user
  if (!req.auth?.user) {
    console.log(`[middleware] REDIRECTING to /login (no auth) from ${pathname}`);
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
