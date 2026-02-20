import NextAuth from "next-auth";
import type { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

/**
 * Full auth config — extends authConfig with the Prisma-backed
 * authorize callback. This runs server-side only (NOT in Edge middleware).
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.username) {
          return null;
        }

        const username = credentials.username as string;

        // Dynamic import — only runs server-side during sign-in
        const { prisma } = await import("@/lib/db");

        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user || !user.active) {
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        } as User;
      },
    }),
  ],
});
