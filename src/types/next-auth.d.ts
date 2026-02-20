import { DefaultSession } from "next-auth";

// Use string union instead of importing Role from @prisma/client
// to avoid pulling Prisma into the Edge Function bundle.
type Role = "ADMIN" | "OFFICER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: Role;
  }
}
