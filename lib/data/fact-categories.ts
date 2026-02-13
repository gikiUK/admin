const CATEGORIES: { key: string; label: string; factIds: string[] }[] = [
  {
    key: "company-profile",
    label: "Company Profile",
    factIds: ["industries", "size", "measures_emissions", "has_reduction_targets"]
  },
  {
    key: "buildings-energy",
    label: "Buildings & Energy",
    factIds: [
      "owns_buildings",
      "leases_buildings",
      "remote_only",
      "has_utility_control",
      "has_operational_control",
      "landlord_controlled_only",
      "building_types",
      "has_renewable_electricity",
      "uses_buildings"
    ]
  },
  {
    key: "transport-travel",
    label: "Transport & Travel",
    factIds: [
      "has_company_vehicles",
      "employees_travel_for_work",
      "travel_includes_flying",
      "has_commuting_workers",
      "has_remote_workers",
      "has_offsite_workers"
    ]
  },
  {
    key: "supply-chain",
    label: "Supply Chain",
    factIds: [
      "interested_in_supplier_actions",
      "supply_chain_challenges",
      "purchases_capital_goods",
      "receives_supplier_deliveries",
      "ships_products_to_customers",
      "produces_waste"
    ]
  },
  {
    key: "products",
    label: "Products",
    factIds: ["products_consume_energy_in_use", "products_require_disposal"]
  },
  {
    key: "investments",
    label: "Investments",
    factIds: ["has_significant_investments"]
  },
  {
    key: "engagement-priorities",
    label: "Engagement & Priorities",
    factIds: [
      "interested_in_employee_learning",
      "interested_in_strategy",
      "interested_in_industry_benchmarks",
      "interested_in_offsetting",
      "interested_in_communication",
      "interested_in_esg",
      "interested_in_regulation",
      "interested_in_other",
      "priority_buildings_energy",
      "priority_transport_travel",
      "priority_supply_chain",
      "priority_products",
      "priority_investments",
      "priority_employee_engagement",
      "priority_strategy_governance",
      "priority_nature"
    ]
  },
  {
    key: "ghg-relevance",
    label: "GHG Relevance",
    factIds: [
      "scope_1_mobile_relevant",
      "cat_1_relevant",
      "cat_2_relevant",
      "cat_3_relevant",
      "cat_4_relevant",
      "cat_5_relevant",
      "cat_6_relevant",
      "cat_7_relevant",
      "cat_8_relevant",
      "cat_9_relevant",
      "cat_10_relevant",
      "cat_11_relevant",
      "cat_12_relevant",
      "cat_13_relevant"
    ]
  }
];

const factToCategory = new Map<string, string>();
for (const cat of CATEGORIES) {
  for (const id of cat.factIds) {
    factToCategory.set(id, cat.key);
  }
}

export function assignCategory(factId: string): string {
  return factToCategory.get(factId) ?? "uncategorized";
}

export function getCategoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? "Uncategorized";
}

export function getCategoryOrder(): string[] {
  return CATEGORIES.map((c) => c.key);
}
