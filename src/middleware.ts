import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/api"];
  
  // Check if path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check if DEMO_MODE is enabled
  const demoMode = process.env.DEMO_MODE === "true";
  
  // For protected paths, check for session token
  // NextAuth v5 uses different cookie names in production vs development
  const hasSession = request.cookies.has("authjs.session-token") ||
                     request.cookies.has("__Secure-authjs.session-token");
  
  // Allow access if session exists OR if DEMO_MODE is enabled
  if (!hasSession && !demoMode) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
