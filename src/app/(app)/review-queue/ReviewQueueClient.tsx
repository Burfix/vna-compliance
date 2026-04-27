"use client";

import { useState } from "react";
import type { ReviewQueueItem } from "@/lib/compliance/queries";

type ReviewAction = "APPROVED" | "REJECTED" | "REQUEST_RESUBMISSION";

interface Props {
  items: ReviewQueueItem[];
}

const riskBadge = (level: "low" | "medium" | "high") => {
  if (level === "high") return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-medium">High Risk</span>;
  if (level === "medium") return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 font-medium">Medium Risk</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-medium">Low Risk</span>;
};

export default function ReviewQueueClient({ items }: Props) {
  const [queue, setQueue] = useState<ReviewQueueItem[]>(items);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

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
      const labels: Record<ReviewAction, string> = {
        APPROVED: "Certificate approved.",
        REJECTED: "Certificate rejected. Tenant notified.",
        REQUEST_RESUBMISSION: "Resubmission requested. Tenant notified.",
      };
      setMessage({ text: labels[decision], ok: true });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "An error occurred", ok: false });
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
          {queue.length} certificate{queue.length !== 1 ? "s" : ""} awaiting review
        </p>

        {message && (
          <div className={`px-3 py-2 rounded-lg text-sm mb-3 border ${message.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            {message.text}
          </div>
        )}

        {queue.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-sm font-semibold text-gray-700">Review queue is clear</p>
            <p className="text-xs text-gray-400 mt-1">All submitted certificates have been reviewed.</p>
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
                  : item.riskLevel === "high"
                  ? "border-red-200 bg-red-50 hover:border-red-300"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900 truncate flex-1">
                  {item.typeName}
                </p>
                {riskBadge(item.riskLevel)}
              </div>
              <p className="text-xs text-gray-600 mt-0.5 truncate">{item.storeName}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs text-gray-400">{item.storeCode}</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">{item.precinct}</span>
              </div>
              {item.uploadedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Submitted {new Date(item.uploadedAt).toLocaleDateString()}
                </p>
              )}
              {item.expiresAt && (
                <p className={`text-xs mt-0.5 font-medium ${item.riskLevel === "high" ? "text-red-600" : "text-yellow-600"}`}>
                  Expires {new Date(item.expiresAt).toLocaleDateString()}
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
            <p className="text-sm">Select a certificate from the queue to review</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  Awaiting Review
                </p>
                {riskBadge(selected.riskLevel)}
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {selected.typeName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selected.storeName} · {selected.storeCode} · {selected.precinct}
              </p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Upload Date</p>
                <p className="text-gray-800 mt-0.5">
                  {selected.uploadedAt ? new Date(selected.uploadedAt).toLocaleString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Expiry Date</p>
                <p className={`mt-0.5 font-medium ${selected.riskLevel === "high" ? "text-red-600" : selected.riskLevel === "medium" ? "text-yellow-600" : "text-gray-800"}`}>
                  {selected.expiresAt ? new Date(selected.expiresAt).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Certificate File</p>
                {selected.fileName ? (
                  selected.fileKey ? (
                    <a
                      href={`/api/compliance/file?key=${encodeURIComponent(selected.fileKey)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-0.5 block truncate"
                    >
                      📎 {selected.fileName}
                    </a>
                  ) : (
                    <p className="text-gray-600 mt-0.5">📎 {selected.fileName}</p>
                  )
                ) : (
                  <p className="text-gray-400 mt-0.5 italic">No file attached</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tenant</p>
                <p className="text-gray-800 mt-0.5">{selected.storeName}</p>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Review Comment <span className="text-gray-400 font-normal">(optional — visible to tenant)</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add context for the tenant or internal record..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Actions */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Decision</p>
              <div className="flex flex-wrap gap-3">
                <button
                  disabled={loading}
                  onClick={() => handleReview("APPROVED")}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  ✓ Approve
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleReview("REQUEST_RESUBMISSION")}
                  className="flex-1 min-w-[160px] px-4 py-3 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                >
                  ↩ Request Resubmission
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleReview("REJECTED")}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  ✕ Reject
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Each action creates a compliance audit event and updates the certificate status.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
