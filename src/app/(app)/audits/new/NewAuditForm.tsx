"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCategoryColor, getCategoryLabel } from "@/lib/precincts";

interface Store {
  id: string;
  name: string;
  unitCode: string;
  precinct: string;
  category: "FB" | "RETAIL" | "SERVICES";
}

interface Template {
  id: string;
  name: string;
  description: string | null;
}

export default function NewAuditForm({
  stores,
  templates,
  isMockMode,
}: {
  stores: Store[];
  templates: Template[];
  isMockMode: boolean;
}) {
  const router = useRouter();
  const [storeId, setStoreId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedStore = stores.find((s) => s.id === storeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!storeId || !templateId) {
      setError("Please select both a tenant and a template");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isMockMode) {
        // Mock mode: create fake audit and redirect
        const mockAuditId = `audit-mock-${Date.now()}`;
        router.push(`/audits/${mockAuditId}`);
      } else {
        // Real mode: call server action
        const { createAuditDraft } = await import("@/app/(app)/audits/actions");
        const result = await createAuditDraft({ storeId, templateId });
        
        if (result.success && result.auditId) {
          router.push(`/audits/${result.auditId}`);
        } else {
          setError(result.error || "Failed to create audit");
          setIsSubmitting(false);
        }
      }
    } catch {
      setError("An error occurred while creating the audit");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Store Selection */}
      <div>
        <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-2">
          Select Tenant
        </label>
        <select
          id="store"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Choose a tenant...</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name} — {store.precinct} — {store.unitCode}
            </option>
          ))}
        </select>
        {selectedStore && (
          <div className="mt-2 flex gap-2">
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {selectedStore.precinct}
            </span>
            <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(selectedStore.category)}`}>
              {getCategoryLabel(selectedStore.category)}
            </span>
          </div>
        )}
      </div>

      {/* Template Selection */}
      <div>
        <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
          Select Audit Template
        </label>
        <select
          id="template"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Choose a template...</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        {templateId && (
          <p className="mt-2 text-sm text-gray-500">
            {templates.find((t) => t.id === templateId)?.description || "No description available"}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Creating..." : "Create Draft Audit"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>

      {isMockMode && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            🟡 Mock Mode: This will create a simulated audit for testing purposes.
          </p>
        </div>
      )}
    </form>
  );
}
