import { auth } from "@/auth";
import type { Role } from "@prisma/client";

export async function requireUser() {
  const session = await auth();
  
  if (!session?.user) {
    console.error("requireUser FAILED - no session found");
    throw new Error("Unauthorized: Please log in");
  }
  
  console.log("requireUser SUCCESS - user:", session.user.username);
  return session.user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireUser();
  
  if (!allowedRoles.includes(user.role)) {
    console.error("requireRole FAILED - role:", user.role, "not in", allowedRoles);
    throw new Error("Forbidden: Insufficient permissions");
  }
  
  console.log("requireRole SUCCESS - user:", user.username, "role:", user.role);
  return user;
}
