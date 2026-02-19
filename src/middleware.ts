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
  
  // For protected paths, check for any session-related cookies
  const cookies = request.cookies;
  const hasSession = Array.from(cookies.getAll()).some(cookie => 
    cookie.name.includes("session") || cookie.name.includes("authjs")
  );
  
  console.log("Middleware - path:", pathname, "hasSession:", hasSession, "cookies:", Array.from(cookies.getAll()).map(c => c.name));
  
  if (!hasSession) {
    console.log("Middleware - no session, redirecting to login");
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
