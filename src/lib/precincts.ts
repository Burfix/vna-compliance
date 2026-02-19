/**
 * V&A Waterfront Precincts
 * Single source of truth for precinct values across the application
 */

export const PRECINCTS = [
  "Victoria Wharf",
  "Alfred Mall",
  "Silo District",
  "Watershed",
  "Clock Tower",
  "Portswood Ridge",
  "Pierhead",
  "Quay / Harbor",
] as const;

export type Precinct = (typeof PRECINCTS)[number];

// Prisma enum values
export const CATEGORIES = ["FB", "RETAIL", "SERVICES"] as const;

export type Category = (typeof CATEGORIES)[number];

// Display labels
export const CATEGORY_LABELS = {
  FB: "F&B",
  RETAIL: "Retail",
  SERVICES: "Services",
} as const;

/**
 * Get display-friendly precinct name
 */
export function getPrecinctLabel(precinct: Precinct): string {
  return precinct;
}

/**
 * Get display-friendly category name
 */
export function getCategoryLabel(category: Category): string {
  return CATEGORY_LABELS[category];
}

/**
 * Get category badge color classes
 */
export function getCategoryColor(category: Category): string {
  const colors = {
    FB: "bg-orange-100 text-orange-800 border-orange-200",
    RETAIL: "bg-blue-100 text-blue-800 border-blue-200",
    SERVICES: "bg-purple-100 text-purple-800 border-purple-200",
  };
  return colors[category];
}

/**
 * Get precinct emoji icon
 */
export function getPrecinctIcon(precinct: Precinct): string {
  const icons: Record<Precinct, string> = {
    "Victoria Wharf": "🛍️",
    "Alfred Mall": "🏬",
    "Silo District": "🏛️",
    Watershed: "🎨",
    "Clock Tower": "🕰️",
    "Portswood Ridge": "🏘️",
    Pierhead: "⚓",
    "Quay / Harbor": "🌊",
  };
  return icons[precinct];
}
