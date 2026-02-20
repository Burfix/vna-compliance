"use server";

import { signIn } from "@/auth";

export async function demoLogin(username: string) {
  try {
    await signIn("credentials", {
      username,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // NextAuth throws NEXT_REDIRECT on successful login
    throw error;
  }
}
