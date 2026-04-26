import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getReviewQueue } from "@/lib/compliance/queries";
import ReviewQueueClient from "./ReviewQueueClient";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role !== "ADMIN" && role !== "OFFICER") {
    redirect("/dashboard");
  }

  const queue = await getReviewQueue();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600 tracking-wide uppercase">
          Compliance Officer
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">Review Queue</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review and action tenant-submitted compliance documents
        </p>
      </div>

      <ReviewQueueClient items={queue} />
    </div>
  );
}
