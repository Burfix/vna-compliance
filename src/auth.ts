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

        // Normalize: trim whitespace and lowercase so "Burfix@Gmail.com" matches "burfix@gmail.com"
        const identifier = (credentials.username as string).trim().toLowerCase();

        if (!identifier) return null;

        // Dynamic import â€" only runs server-side during sign-in
        const { prisma } = await import("@/lib/db");

        // Case-insensitive lookup â€" username field stores full email like "burfix@gmail.com"
        const user = await prisma.user.findFirst({
          where: {
            username: { equals: identifier, mode: "insensitive" },
          },
        });

        if (!user || !user.active) {
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          storeId: user.storeId ?? null,
        } as User;
      },
    }),
  ],
});
