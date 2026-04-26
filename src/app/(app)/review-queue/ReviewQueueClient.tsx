"use client";

import { useState } from "react";
import type { ReviewQueueItem } from "@/lib/compliance/queries";

type ReviewAction = "APPROVED" | "REJECTED" | "REQUEST_RESUBMISSION";

interface Props {
  items: ReviewQueueItem[];
}

export default function ReviewQueueClient({ items }: Props) {
  const [queue, setQueue] = useState<ReviewQueueItem[]>(items);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleReview(decision: ReviewAction) {
    if (!selectedId) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/compliance/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId: selectedId,
          decision,
          comment: comment.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Review failed");

      setQueue((q) => q.filter((item) => item.id !== selectedId));
      setSelectedId(null);
      setComment("");
      setMessage(`Certificate ${decision.toLowerCase().replace(/_/g, " ")} successfully.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const selected = queue.find((i) => i.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Queue list */}
      <div className="lg:col-span-1 space-y-2">
        <p className="text-sm font-medium text-gray-500 mb-3">
          {queue.length} document{queue.length !== 1 ? "s" : ""} awaiting review
        </p>

        {message && (
          <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 mb-3">
            {message}
          </div>
        )}

        {queue.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-sm text-gray-500">Queue is clear — all caught up!</p>
          </div>
        ) : (
          queue.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedId(item.id);
                setComment("");
                setMessage(null);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                selectedId === item.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <p className="text-sm font-semibold text-gray-900 truncate">
                {item.typeName}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{item.storeName}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-gray-400">{item.storeCode}</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">{item.precinct}</span>
              </div>
              {item.uploadedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Uploaded {new Date(item.uploadedAt).toLocaleDateString()}
                </p>
              )}
            </button>
          ))
        )}
      </div>

      {/* Right: Review panel */}
      <div className="lg:col-span-2">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200 text-gray-400">
            <p className="text-4xl mb-3">👈</p>
            <p className="text-sm">Select a document from the queue to review</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                Under Review
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {selected.typeName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selected.storeName} · {selected.storeCode} · {selected.precinct}
              </p>
              {selected.fileName && (
                <p className="text-sm text-gray-500 mt-1">📎 {selected.fileName}</p>
              )}
              {selected.uploadedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Submitted {new Date(selected.uploadedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Comment field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Comment <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a note for the tenant..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                disabled={loading}
                onClick={() => handleReview("APPROVED")}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                ✓ Approve
              </button>
              <button
                disabled={loading}
                onClick={() => handleReview("REQUEST_RESUBMISSION")}
                className="flex-1 px-4 py-2.5 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors"
              >
                ↩ Request Resubmission
              </button>
              <button
                disabled={loading}
                onClick={() => handleReview("REJECTED")}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                ✕ Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
