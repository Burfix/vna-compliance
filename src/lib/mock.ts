/**
 * Mock data for MOCK_MODE
 * Enables visual testing and development without database dependency
 * V&A Waterfront themed data
 */

import { Role, Category, AuditStatus } from "@prisma/client";
import type { Precinct } from "./precincts";

export const mockUser = {
  id: "mock-user-1",
  name: "Sarah Johnson",
  username: "sarah",
  role: "ADMIN" as Role,
};

export const mockStores = [
  // Silo District (F&B heavy + events)
  {
    id: "store-1",
    name: "Si Cantina Sociale",
    unitCode: "SD-101",
    precinct: "Silo District" as Precinct,
    category: "FB" as Category,
    active: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "store-2",
    name: "The Silo Rooftop",
    unitCode: "SD-201",
    precinct: "Silo District" as Precinct,
    category: "FB" as Category,
    active: true,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "store-3",
    name: "Zeitz MOCAA Gallery Shop",
    unitCode: "SD-105",
    precinct: "Silo District" as Precinct,
    category: "Retail" as Category,
    active: true,
    createdAt: new Date("2024-02-01"),
  },

  // Quay / Harbor (F&B + tourism)
  {
    id: "store-4",
    name: "Time Out Market",
    unitCode: "QH-301",
    precinct: "Quay / Harbor" as Precinct,
    category: "FB" as Category,
    active: true,
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "store-5",
    name: "Harbor Fish Market",
    unitCode: "QH-102",
    precinct: "Quay / Harbor" as Precinct,
    category: "FB" as Category,
    active: true,
    createdAt: new Date("2024-01-12"),
  },
  {
    id: "store-6",
    name: "Boat Tours & Charters",
    unitCode: "QH-50",
    precinct: "Quay / Harbor" as Precinct,
    category: "Services" as Category,
    active: true,
    createdAt: new Date("2024-02-05"),
  },

  // Victoria Wharf (retail-heavy with some F&B)
  {
    id: "store-7",
    name: "Woolworths Food",
    unitCode: "VW-201",
    precinct: "Victoria Wharf" as Precinct,
    category: "Retail" as Category,
    active: true,
    createdAt: new Date("2023-12-01"),
  },
  {
    id: "store-8",
    name: "Victoria Wharf Food Court",
    unitCode: "VW-FC01",
    precinct: "Victoria Wharf" as Precinct,
    category: "FB" as Category,
    active: true,
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "store-9",
    name: "Edgars Department Store",
    unitCode: "VW-150",
    precinct: "Victoria Wharf" as Precinct,
    category: "Retail" as Category,
    active: true,
    createdAt: new Date("2023-11-15"),
  },
  {
    id: "store-10",
    name: "CNA Bookstore",
    unitCode: "VW-78",
    precinct: "Victoria Wharf" as Precinct,
    category: "Retail" as Category,
    active: true,
    createdAt: new Date("2024-01-08"),
  },

  // Alfred Mall (mixed retail/services)
  {
    id: "store-11",
    name: "Cape Union Mart",
    unitCode: "AM-45",
    precinct: "Alfred Mall" as Precinct,
    category: "Retail" as Category,
    active: true,
    createdAt: new Date("2024-01-18"),
  },
  {
    id: "store-12",
    name: "Clicks Pharmacy",
    unitCode: "AM-23",
    precinct: "Alfred Mall" as Precinct,
    category: "Services" as Category,
    active: true,
    createdAt: new Date("2024-02-10"),
  },
  {
    id: "store-13",
    name: "Alfred Cafe",
    unitCode: "AM-12",
    precinct: "Alfred Mall" as Precinct,
    category: "FB" as Category,
    active: true,
    createdAt: new Date("2024-01-22"),
  },

  // Watershed (crafts/retail)
  {
    id: "store-14",
    name: "African Craft Market",
    unitCode: "WS-10",
    precinct: "Watershed" as Precinct,
    category: "Retail" as Category,
    active: true,
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "store-15",
    name: "Watershed Design Studio",
    unitCode: "WS-25",
    precinct: "Watershed" as Precinct,
    category: "Retail" as Category,
    active: true,
    createdAt: new Date("2024-02-01"),
  },

  // Clock Tower (tourism/services/retail)
  {
    id: "store-16",
    name: "Clock Tower Info Center",
    unitCode: "CT-01",
    precinct: "Clock Tower" as Precinct,
    category: "Services" as Category,
    active: true,
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "store-17",
    name: "Tower Gifts & Souvenirs",
    unitCode: "CT-15",
    precinct: "Clock Tower" as Precinct,
    category: "Retail" as Category,
    active: true,
    createdAt: new Date("2024-01-20"),
  },

  // Pierhead (retail/tourism)
  {
    id: "store-18",
    name: "Pierhead Craft Beer Garden",
    unitCode: "PH-30",
    precinct: "Pierhead" as Precinct,
    category: "FB" as Category,
    active: true,
    createdAt: new Date("2024-02-08"),
  },
  {
    id: "store-19",
    name: "Waterfront Souvenirs",
    unitCode: "PH-12",
    precinct: "Pierhead" as Precinct,
    category: "Retail" as Category,
    active: true,
    createdAt: new Date("2024-01-25"),
  },

  // Portswood Ridge (mixed)
  {
    id: "store-20",
    name: "Ridge Fitness Center",
    unitCode: "PR-101",
    precinct: "Portswood Ridge" as Precinct,
    category: "Services" as Category,
    active: true,
    createdAt: new Date("2024-01-30"),
  },
];

export const mockTemplates = [
  {
    id: "template-1",
    name: "F&B Standard Compliance Check",
    description: "Monthly compliance audit covering food safety, hygiene, and kitchen operations",
    active: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "template-2",
    name: "Retail Safety & OHS",
    description: "Occupational health and safety inspection for retail environments",
    active: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "template-3",
    name: "Late-Night Venue Compliance",
    description: "Extended hours venue compliance including noise, security, and patron safety",
    active: true,
    createdAt: new Date("2024-01-01"),
  },
];

export const mockAudits = [
  {
    id: "audit-1",
    storeId: "store-4",
    templateId: "template-1",
    conductedById: "mock-user-1",
    status: "SUBMITTED" as AuditStatus,
    auditDate: new Date("2024-02-15"),
    createdAt: new Date("2024-02-15"),
    store: mockStores[3], // Time Out Market
    template: mockTemplates[0],
    conductedBy: mockUser,
    score: 87,
  },
  {
    id: "audit-2",
    storeId: "store-1",
    templateId: "template-1",
    conductedById: "mock-user-1",
    status: "SUBMITTED" as AuditStatus,
    auditDate: new Date("2024-02-14"),
    createdAt: new Date("2024-02-14"),
    store: mockStores[0], // Si Cantina Sociale
    template: mockTemplates[0],
    conductedBy: mockUser,
    score: 92,
  },
  {
    id: "audit-3",
    storeId: "store-7",
    templateId: "template-2",
    conductedById: "mock-user-1",
    status: "DRAFT" as AuditStatus,
    auditDate: new Date("2024-02-18"),
    createdAt: new Date("2024-02-18"),
    store: mockStores[6], // Woolworths Food
    template: mockTemplates[1],
    conductedBy: mockUser,
    score: null,
  },
  {
    id: "audit-4",
    storeId: "store-18",
    templateId: "template-3",
    conductedById: "mock-user-1",
    status: "SUBMITTED" as AuditStatus,
    auditDate: new Date("2024-02-10"),
    createdAt: new Date("2024-02-10"),
    store: mockStores[17], // Pierhead Craft Beer Garden
    template: mockTemplates[2],
    conductedBy: mockUser,
    score: 78,
  },
  {
    id: "audit-5",
    storeId: "store-8",
    templateId: "template-1",
    conductedById: "mock-user-1",
    status: "SUBMITTED" as AuditStatus,
    auditDate: new Date("2024-02-12"),
    createdAt: new Date("2024-02-12"),
    store: mockStores[7], // Victoria Wharf Food Court
    template: mockTemplates[0],
    conductedBy: mockUser,
    score: 74,
  },
];

export const dashboardMetrics = {
  totalStores: 20,
  nonCompliantStores: 3,
  auditsThisMonth: 5,
  openActions: 7,
  avgComplianceScore: 82.8,
};

export const riskStores = [
  {
    id: "store-8",
    name: "Victoria Wharf Food Court",
    unitCode: "VW-FC01",
    precinct: "Victoria Wharf" as Precinct,
    category: "FB" as Category,
    lastScore: 74,
    lastAuditDate: new Date("2024-02-12"),
    riskLevel: "medium" as const,
  },
  {
    id: "store-18",
    name: "Pierhead Craft Beer Garden",
    unitCode: "PH-30",
    precinct: "Pierhead" as Precinct,
    category: "FB" as Category,
    lastScore: 78,
    lastAuditDate: new Date("2024-02-10"),
    riskLevel: "medium" as const,
  },
  {
    id: "store-4",
    name: "Time Out Market",
    unitCode: "QH-301",
    precinct: "Quay / Harbor" as Precinct,
    category: "FB" as Category,
    lastScore: 87,
    lastAuditDate: new Date("2024-02-15"),
    riskLevel: "low" as const,
  },
  {
    id: "store-1",
    name: "Si Cantina Sociale",
    unitCode: "SD-101",
    precinct: "Silo District" as Precinct,
    category: "FB" as Category,
    lastScore: 92,
    lastAuditDate: new Date("2024-02-14"),
    riskLevel: "low" as const,
  },
];

// Precinct-level risk aggregation
export const riskPrecincts = [
  {
    precinct: "Pierhead" as Precinct,
    avgScore: 78,
    openActions: 3,
    riskLevel: "medium" as const,
    tenantsAudited: 2,
  },
  {
    precinct: "Victoria Wharf" as Precinct,
    avgScore: 80,
    openActions: 2,
    riskLevel: "medium" as const,
    tenantsAudited: 3,
  },
  {
    precinct: "Quay / Harbor" as Precinct,
    avgScore: 84,
    openActions: 1,
    riskLevel: "low" as const,
    tenantsAudited: 2,
  },
];

export const recentAudits = mockAudits.slice(0, 5).map((audit) => ({
  ...audit,
  storeName: audit.store.name,
  templateName: audit.template.name,
  conductedByName: audit.conductedBy.name,
}));

/**
 * Simulates creating a new audit draft
 */
export function createMockAudit(): string {
  const newId = `audit-mock-${Date.now()}`;
  return newId;
}

/**
 * Gets a mock audit by ID
 */
export function getMockAuditById(id: string) {
  const found = mockAudits.find((a) => a.id === id);
  if (found) return found;

  // Return a placeholder for new mock audits
  return {
    id,
    storeId: "store-1",
    templateId: "template-1",
    conductedById: "mock-user-1",
    status: "DRAFT" as AuditStatus,
    auditDate: new Date(),
    createdAt: new Date(),
    store: mockStores[0],
    template: mockTemplates[0],
    conductedBy: mockUser,
    score: null,
  };
}
