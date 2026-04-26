import { DefaultSession } from "next-auth";

// String union — avoids pulling Prisma into the Edge Function bundle.
type Role = "ADMIN" | "OFFICER" | "EXECUTIVE" | "TENANT";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: Role;
      storeId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: Role;
    storeId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: Role;
    storeId?: string | null;
  }
}
