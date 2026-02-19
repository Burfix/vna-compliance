"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCategoryColor, getCategoryLabel } from "@/lib/precincts";
import { VA_FB_STANDARD_TEMPLATE, getTemplateItems } from "@/lib/auditTemplates";

interface ChecklistItem {
  id: string;
  label: string;
  status: "compliant" | "non-compliant" | "pending" | "na";
  required?: boolean;
}

interface AuditDetailClientProps {
  audit: {
    id: string;
    status: string;
    auditDate: Date;
    store: {
      name: string;
      unitCode: string;
      precinct: string;
      category: "FB" | "RETAIL" | "SERVICES";
    };
    template: {
      name: string;
      description: string | null;
    };
    conductedBy: {
      name: string | null;
      email: string;
    };
    score: number | null;
  };
  isMockMode: boolean;
}

export default function AuditDetailClient({ audit, isMockMode }: AuditDetailClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [localStatus, setLocalStatus] = useState(audit.status);
  
  // Initialize checklist from V&A template
  const templateItems = getTemplateItems(VA_FB_STANDARD_TEMPLATE);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    templateItems.map(item => ({
      id: item.id,
      label: item.label,
      status: "pending" as const,
      required: item.required,
    }))
  );

  // Calculate score automatically (excluding N/A items)
  const calculateScore = () => {
    const applicableItems = checklistItems.filter(item => item.status !== "na");
    const total = applicableItems.length;
    const compliant = applicableItems.filter(item => item.status === "compliant").length;
    return total > 0 ? Math.round((compliant / total) * 100) : 0;
  };

  const [calculatedScore, setCalculatedScore] = useState(calculateScore());

  // Update score whenever checklist changes
  useEffect(() => {
    setCalculatedScore(calculateScore());
  }, [checklistItems]);

  const handleItemChange = (itemId: string, newStatus: "compliant" | "non-compliant" | "na") => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      if (isMockMode) {
        // Mock mode: simulate submission
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLocalStatus("SUBMITTED");
        alert(`✅ Audit submitted successfully!\nFinal Score: ${calculatedScore}%`);
      } else {
        // Real mode: call server action
        const { submitAudit } = await import("@/app/(app)/audits/actions");
        await submitAudit(audit.id);
        setLocalStatus("SUBMITTED");
        router.refresh();
      }
    } catch {
      setError("An error occurred while submitting the audit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDraft = localStatus === "DRAFT";
  const compliantCount = checklistItems.filter(item => item.status === "compliant").length;
  const nonCompliantCount = checklistItems.filter(item => item.status === "non-compliant").length;
  const naCount = checklistItems.filter(item => item.status === "na").length;
  const pendingCount = checklistItems.filter(item => item.status === "pending").length;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Audit Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Audit Details</h2>
            <p className="text-sm text-gray-500 mt-1">Audit ID: {audit.id}</p>
          </div>
          <div>
            {getStatusBadge(localStatus)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Tenant</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{audit.store.name}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                {audit.store.precinct}
              </span>
              <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(audit.store.category)}`}>
                {getCategoryLabel(audit.store.category)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{audit.store.unitCode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Template</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{audit.template.name}</p>
            <p className="text-sm text-gray-600">{audit.template.description || "No description"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Conducted By</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{audit.conductedBy.name || "Unknown"}</p>
            <p className="text-sm text-gray-600">{audit.conductedBy.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Audit Date</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {new Date(audit.auditDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {audit.score !== null && !isDraft ? (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500">Final Compliance Score</p>
            <p className={`mt-1 text-3xl font-bold ${getScoreColor(audit.score)}`}>
              {audit.score}%
            </p>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500">Current Score (Live)</p>
            <p className={`mt-1 text-3xl font-bold ${getScoreColor(calculatedScore)}`}>
              {calculatedScore}%
            </p>
            <div className="mt-3 grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{compliantCount}</p>
                <p className="text-xs text-gray-500">Compliant</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{nonCompliantCount}</p>
                <p className="text-xs text-gray-500">Non-Compliant</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{naCount}</p>
                <p className="text-xs text-gray-500">N/A</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">{pendingCount}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audit Checklist */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{VA_FB_STANDARD_TEMPLATE.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {VA_FB_STANDARD_TEMPLATE.sections.length} sections • {checklistItems.length} items
            </p>
          </div>
          {isDraft && (
            <span className="text-sm font-medium text-gray-600">
              {calculatedScore}% complete
            </span>
          )}
        </div>

        <div className="space-y-6">
          {VA_FB_STANDARD_TEMPLATE.sections.map((section) => {
            const sectionItems = checklistItems.filter(item =>
              section.items.some(templateItem => templateItem.id === item.id)
            );
            const applicableSectionItems = sectionItems.filter(i => i.status !== "na");
            const sectionCompliant = applicableSectionItems.filter(i => i.status === "compliant").length;
            const sectionTotal = applicableSectionItems.length;
            const sectionScore = sectionTotal > 0 ? Math.round((sectionCompliant / sectionTotal) * 100) : 0;

            return (
              <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Section Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{section.title}</h4>
                    <span className={`text-sm font-medium ${getScoreColor(sectionScore)}`}>
                      {sectionCompliant}/{sectionTotal} ({sectionScore}%)
                    </span>
                  </div>
                </div>

                {/* Section Items */}
                <div className="divide-y divide-gray-200">
                  {sectionItems.map((item) => (
                    <ChecklistItemRow
                      key={item.id}
                      item={item}
                      onChange={handleItemChange}
                      disabled={!isDraft}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {isDraft && pendingCount > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ You have {pendingCount} pending {pendingCount === 1 ? 'item' : 'items'}. 
              Mark all items as Compliant or Non-Compliant before submitting.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {isDraft && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || pendingCount > 0}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            title={pendingCount > 0 ? "Complete all checklist items before submitting" : ""}
          >
            {isSubmitting ? "Submitting..." : `✓ Submit Audit (${calculatedScore}%)`}
          </button>
        )}
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {isMockMode && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            🟡 Mock Mode: Changes are not saved to the database. Score is calculated in real-time.
          </p>
        </div>
      )}
    </div>
  );
}

// Interactive Checklist Item Component
function ChecklistItemRow({ 
  item, 
  onChange, 
  disabled 
}: { 
  item: ChecklistItem; 
  onChange: (id: string, status: "compliant" | "non-compliant" | "na") => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900">{item.label}</p>
          {item.required && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 border border-red-200 rounded">
              Required
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 ml-4">
        {/* Compliant Button */}
        <button
          onClick={() => !disabled && onChange(item.id, "compliant")}
          disabled={disabled}
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
            item.status === "compliant"
              ? "bg-green-600 text-white border-2 border-green-700 shadow-sm"
              : "bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500 hover:bg-green-50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span className="mr-1">{item.status === "compliant" ? "✓" : "○"}</span>
          Compliant
        </button>

        {/* Non-Compliant Button */}
        <button
          onClick={() => !disabled && onChange(item.id, "non-compliant")}
          disabled={disabled}
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
            item.status === "non-compliant"
              ? "bg-red-600 text-white border-2 border-red-700 shadow-sm"
              : "bg-white text-gray-700 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span className="mr-1">{item.status === "non-compliant" ? "✗" : "○"}</span>
          Non-Compliant
        </button>

        {/* N/A Button */}
        <button
          onClick={() => !disabled && onChange(item.id, "na")}
          disabled={disabled}
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
            item.status === "na"
              ? "bg-blue-600 text-white border-2 border-blue-700 shadow-sm"
              : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span className="mr-1">{item.status === "na" ? "—" : "○"}</span>
          N/A
        </button>
      </div>
    </div>
  );
}

function getStatusBadge(status: string) {
  const badges = {
    DRAFT: <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200 rounded-full">Draft</span>,
    SUBMITTED: <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 border border-green-200 rounded-full">✓ Submitted</span>,
  };
  return badges[status as keyof typeof badges] || badges.DRAFT;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-blue-600";
  if (score >= 70) return "text-yellow-600";
  return "text-red-600";
}
