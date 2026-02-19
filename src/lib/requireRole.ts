import { auth } from "@/auth";
import type { Role } from "@prisma/client";

export async function requireUser() {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Unauthorized: Please log in");
  }
  
  return session.user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireUser();
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  
  return user;
}
