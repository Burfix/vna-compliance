"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginAction(formData: FormData) {
  const username = (formData.get("username") as string)?.trim().toLowerCase();

  if (!username) {
    return { error: "Email address is required" };
  }

  try {
    await signIn("credentials", {
      username,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // AuthError = failed authentication (wrong credentials / user not found)
    if (error instanceof AuthError) {
      return { error: "User not found. Contact your compliance administrator." };
    }
    // Re-throw everything else — including NEXT_REDIRECT (successful login redirect)
    throw error;
  }
}
