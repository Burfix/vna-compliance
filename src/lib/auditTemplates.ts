/**
 * V&A Waterfront Audit Templates
 * Comprehensive checklists for different tenant categories
 */

export interface AuditTemplateItem {
  id: string;
  label: string;
  required?: boolean;
}

export interface AuditTemplateSection {
  id: string;
  title: string;
  items: AuditTemplateItem[];
}

export interface AuditTemplate {
  id: string;
  name: string;
  storeCategory: "FB" | "RETAIL" | "SERVICES";
  sections: AuditTemplateSection[];
}

export const VA_FB_STANDARD_TEMPLATE: AuditTemplate = {
  id: "va-fb-boh-v1",
  name: "V&A BOH Food & Beverage Checklist",
  storeCategory: "FB",
  sections: [
    {
      id: "general_condition",
      title: "General Condition of Premises",
      items: [
        { id: "floors_clear", label: "Are the floors clear of any obstructions?", required: true },
        { id: "tiles_secured", label: "Are all tiles and carpets properly secured?", required: true },
        { id: "equipment_working", label: "All furniture and equipment in good working order?", required: true },
        { id: "doors_fittings", label: "All doors, hinges and fittings in good order?", required: true },
        { id: "safe_stacking", label: "Is stacking and storage done safely and compliant?", required: true },
      ],
    },

    {
      id: "fire_safety",
      title: "Fire, Emergency & Safety Management",
      items: [
        { id: "extinguishers", label: "Fire extinguishers and safety blankets available, serviced and accessible?", required: true },
        { id: "first_aid", label: "Fully stocked first aid kit available and competent first aider appointed?", required: true },
        { id: "signage", label: "Photoluminescent fire safety signs compliant with SABS legislation?", required: true },
        { id: "fire_door", label: "Fire door in good condition and not tampered with?", required: true },
        { id: "heat_detectors", label: "Heat detectors provided and clean?", required: true },
        { id: "sprinklers", label: "Sprinkler heads provided and clean?", required: true },
        { id: "smoke_detectors", label: "Smoke detectors provided and clean?", required: true },
        { id: "canopy_cert", label: "Up-to-date canopy extraction certificates submitted and displayed?", required: true },
        { id: "canopy_service", label: "Professional canopy extraction cleaning undertaken?", required: true },
        { id: "suppression", label: "Suppression system serviced and labelled with dates?", required: true },
        { id: "ecology", label: "Ecology unit serviced and certificate available?" },
      ],
    },

    {
      id: "electrical",
      title: "Electrical",
      items: [
        { id: "lights_working", label: "All light fittings and switches in good working order?", required: true },
        { id: "bulbs_working", label: "Light bulbs/tubes in good working order?", required: true },
        { id: "distribution_board", label: "Distribution board accessible and compliant?", required: true },
        { id: "exposed_wiring", label: "No exposed electrical wiring?", required: true },
        { id: "sufficient_light", label: "Sufficient lighting (natural or artificial)?", required: true },
        { id: "plug_overload", label: "No overloading of plug walls?", required: true },
        { id: "plugs_safe", label: "All wall plugs safe to use?", required: true },
        { id: "cords_safe", label: "Power cords safely routed away from water/heat?", required: true },
        { id: "fridge_release", label: "Walk-in fridge/freezer emergency release mechanism fitted?", required: true },
      ],
    },

    {
      id: "gas",
      title: "Gas",
      items: [
        { id: "gas_bottles", label: "Gas bottles approved by management?", required: true },
        { id: "gas_detection", label: "Gas leak detection & shutoff valve serviced with certificate available?" },
        { id: "bump_rail", label: "Bump rail fitted behind cooking equipment?" },
        { id: "gas_signage", label: "Gas shutoff valve clearly marked and accessible?", required: true },
      ],
    },

    {
      id: "plumbing",
      title: "Plumbing",
      items: [
        { id: "no_leaks", label: "No leaking taps, pipes or drains?", required: true },
        { id: "water_heater", label: "Water heater serviced with certificate available?", required: true },
        { id: "grease_trap", label: "Grease trap serviced with certificate available?", required: true },
        { id: "drains_clean", label: "All drains clean, clear and free flowing?", required: true },
        { id: "hot_water", label: "Hot water available in food preparation areas?", required: true },
      ],
    },

    {
      id: "hygiene_sanitation",
      title: "Hygiene and Sanitation",
      items: [
        { id: "areas_clean", label: "All areas clean and free of dirt, grease and food debris?", required: true },
        { id: "walls_clean", label: "Walls, ceilings and floors clean and in good condition?", required: true },
        { id: "equipment_clean", label: "All equipment and surfaces clean and sanitized?", required: true },
        { id: "hand_washing", label: "Hand washing facilities with soap and towels available?", required: true },
        { id: "sanitizers", label: "Sanitizers and cleaning chemicals properly stored and labelled?", required: true },
        { id: "refuse_disposal", label: "Refuse disposal adequate with bins lidded and lined?", required: true },
        { id: "pest_control", label: "Pest control measures in place and documented?", required: true },
      ],
    },

    {
      id: "food_safety",
      title: "Food Safety & Storage",
      items: [
        { id: "temp_control", label: "Temperature control in place for hot and cold storage?", required: true },
        { id: "temp_logs", label: "Temperature logs maintained and up to date?", required: true },
        { id: "food_covered", label: "All food covered and protected from contamination?", required: true },
        { id: "fifo", label: "FIFO (First In First Out) system implemented?", required: true },
        { id: "labelling", label: "Food items properly labelled with dates?", required: true },
        { id: "raw_cooked", label: "Raw and cooked foods stored separately?", required: true },
        { id: "allergen_info", label: "Allergen information available and displayed?", required: true },
      ],
    },

    {
      id: "staff_compliance",
      title: "Staff Compliance",
      items: [
        { id: "uniforms", label: "Staff in clean, proper uniforms?", required: true },
        { id: "hair_restrained", label: "Hair properly restrained (nets/hats)?", required: true },
        { id: "no_jewelry", label: "No excessive jewelry or watches worn?", required: true },
        { id: "health_certs", label: "Valid health certificates for all food handlers?", required: true },
        { id: "training_records", label: "Food safety training records available and current?", required: true },
      ],
    },

    {
      id: "documentation",
      title: "Documentation & Compliance",
      items: [
        { id: "business_license", label: "Valid business license displayed?", required: true },
        { id: "health_cert", label: "Valid health certificate displayed?", required: true },
        { id: "insurance", label: "Current insurance certificates available?", required: true },
        { id: "haccp", label: "HACCP plan in place and documented?" },
        { id: "incident_log", label: "Incident and accident log maintained?", required: true },
      ],
    },
  ],
};

// Helper function to get all items from a template
export function getTemplateItems(template: AuditTemplate): AuditTemplateItem[] {
  return template.sections.flatMap(section => section.items);
}

// Helper function to count total items
export function getTotalItems(template: AuditTemplate): number {
  return getTemplateItems(template).length;
}

// Helper function to count required items
export function getRequiredItems(template: AuditTemplate): number {
  return getTemplateItems(template).filter(item => item.required).length;
}

// Export all available templates
export const AUDIT_TEMPLATES = {
  VA_FB_STANDARD: VA_FB_STANDARD_TEMPLATE,
} as const;
