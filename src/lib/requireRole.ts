import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

export async function requireUser() {
  const session = await auth();
  
  console.log("requireUser - session:", session ? "exists" : "null");
  
  if (!session?.user) {
    console.log("requireUser - no session, redirecting to login");
    redirect("/login");
  }
  
  console.log("requireUser - user:", session.user.username);
  return session.user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireUser();
  
  console.log("requireRole - checking role:", user.role, "against", allowedRoles);
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  
  return user;
}
