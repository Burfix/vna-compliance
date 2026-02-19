"use server";

import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;

  if (!username) {
    return { error: "Username is required" };
  }

  try {
    await signIn("credentials", {
      username,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // NextAuth throws error on failed auth
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      // This is actually a successful redirect
      throw error;
    }
    return { error: "Invalid username. Please try again." };
  }
}
