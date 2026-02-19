import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

export async function requireUser() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
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
