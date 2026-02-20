import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-safe auth configuration.
 * NO Prisma, NO DB imports — safe for middleware (Edge runtime).
 * The Credentials provider here has no `authorize` callback;
 * the full version in auth.ts overrides it with Prisma lookup.
 */
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  basePath: "/api/auth",
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
      },
      // No authorize here — middleware only verifies JWT, never calls authorize.
      // The full authorize callback lives in auth.ts (server-only).
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { id: string; username: string; role: string };
        token.id = u.id;
        token.username = u.username;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const s = session.user as unknown as { id: string; username: string; role: string };
        s.id = token.id as string;
        s.username = token.username as string;
        s.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
