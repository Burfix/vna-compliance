"use client";

import { useState } from "react";
import { getEnv } from "@/lib/env";
import { mockStores } from "@/lib/mock";
import { PRECINCTS, CATEGORIES, getCategoryColor, getPrecinctIcon, getCategoryLabel } from "@/lib/precincts";

export default function StoresPage() {
  const env = getEnv();
  const allStores = env.MOCK_MODE ? mockStores : [];

  const [selectedPrecinct, setSelectedPrecinct] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter stores
  const filteredStores = allStores.filter((store) => {
    if (selectedPrecinct !== "all" && store.precinct !== selectedPrecinct) return false;
    if (selectedCategory !== "all" && store.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view all V&A Waterfront tenants ({filteredStores.length} of {allStores.length})
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          + Add Tenant
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Precinct Filter */}
          <div>
            <label htmlFor="precinct" className="block text-sm font-medium text-gray-700 mb-2">
              Precinct
            </label>
            <select
              id="precinct"
              value={selectedPrecinct}
              onChange={(e) => setSelectedPrecinct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Precincts</option>
              {PRECINCTS.map((precinct) => (
                <option key={precinct} value={precinct}>
                  {precinct}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <span className="text-2xl">{getPrecinctIcon(store.precinct)}</span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded border ${getCategoryColor(store.category)}`}>
                {getCategoryLabel(store.category)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{store.unitCode}</p>
            <p className="text-xs text-gray-500 mt-1">{store.precinct}</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Added {new Date(store.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tenants found matching your filters</p>
        </div>
      )}

      {env.MOCK_MODE && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            🟡 Mock Mode: Showing sample tenants. Full tenant management coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
