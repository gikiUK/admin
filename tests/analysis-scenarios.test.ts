/**
 * End-to-end analysis scenarios.
 *
 * Each scenario is a named synthetic dataset with deliberately broken or clean logic.
 * Run these to verify the analysis engine catches (or correctly ignores) each class of problem.
 * They also serve as regression tests: if a scenario stops reporting its expected issue,
 * something broke in the check or the SAT encoding.
 */

import { runAnalysis } from "@/lib/analysis/run-analysis";
import type { DatasetData } from "@/lib/blob/types";

function issues(data: DatasetData, checkId: string) {
  return runAnalysis(data).checks.find((c) => c.id === checkId)?.issues ?? [];
}

// ── Scenario helpers ──────────────────────────────────────

/**
 * SCENARIO: Contradictory rules — overlapping conditions, different values
 *
 *   fact: heating_type (enum: gas | heat_pump)
 *   rule A: if has_gas_boiler=true  → heating_type = "gas"
 *   rule B: if has_renewables=true  → heating_type = "heat_pump"
 *
 *   A user can have both a gas boiler AND renewables. Both rules fire → contradiction.
 *   Expected: 1 contradictory-rules error on heating_type.
 */
const contradictoryRulesData: DatasetData = {
  facts: {
    has_gas_boiler: { type: "boolean_state", core: true, enabled: true },
    has_renewables: { type: "boolean_state", core: true, enabled: true },
    heating_type: { type: "enum", core: false, enabled: true, values_ref: "HEATING_TYPES" }
  },
  constants: {
    HEATING_TYPES: [
      { id: 1, name: "gas", description: null, enabled: true },
      { id: 2, name: "heat_pump", description: null, enabled: true }
    ]
  },
  questions: [
    { type: "boolean_state", label: "Do you have a gas boiler?", fact: "has_gas_boiler", enabled: true },
    { type: "boolean_state", label: "Do you have renewables?", fact: "has_renewables", enabled: true }
  ],
  rules: [
    { sets: "heating_type", value: "gas", source: "general", when: { has_gas_boiler: true }, enabled: true },
    { sets: "heating_type", value: "heat_pump", source: "general", when: { has_renewables: true }, enabled: true }
  ],
  action_conditions: {}
};

/**
 * SCENARIO: Non-contradictory rules — hotspot suppression overlapping with general rule
 *
 *   General rule: if has_significant_investments=true → cat_15_relevant = true
 *   Hotspot rule: if industries includes "Advertising" → cat_15_relevant = not_applicable
 *
 *   A company in Advertising can also have significant investments — both conditions overlap.
 *   But this is intentional: not_applicable is a suppression, not an assertion. The hotspot
 *   overrides the general rule for that industry. This is NOT a contradiction.
 *   Expected: 0 contradictory-rules errors.
 */
const hotspotSuppressionData: DatasetData = {
  facts: {
    has_significant_investments: { type: "boolean_state", core: true, enabled: true },
    industries: { type: "array", core: true, enabled: true, values_ref: "INDUSTRY_OPTIONS" },
    cat_15_relevant: { type: "boolean_state", core: false, enabled: true }
  },
  constants: {
    INDUSTRY_OPTIONS: [
      { id: 1, name: "Advertising", description: null, enabled: true },
      { id: 2, name: "Manufacturing", description: null, enabled: true }
    ]
  },
  questions: [
    { type: "boolean_state", label: "Significant investments?", fact: "has_significant_investments", enabled: true }
  ],
  rules: [
    {
      sets: "cat_15_relevant",
      value: true,
      source: "general",
      when: { has_significant_investments: true },
      enabled: true
    },
    {
      sets: "cat_15_relevant",
      value: "not_applicable",
      source: "hotspot",
      when: { industries: ["Advertising"] },
      enabled: true
    }
  ],
  action_conditions: {}
};

/**
 * SCENARIO: Non-contradictory rules — mutually exclusive conditions
 *
 *   Same facts and rules as the contradictory scenario, but each rule requires the other
 *   condition to be false. A user cannot satisfy both simultaneously.
 *   Expected: 0 contradictory-rules errors.
 */
const exclusiveRulesData: DatasetData = {
  ...contradictoryRulesData,
  rules: [
    {
      sets: "heating_type",
      value: "gas",
      source: "general",
      when: { has_gas_boiler: true, has_renewables: false },
      enabled: true
    },
    {
      sets: "heating_type",
      value: "heat_pump",
      source: "general",
      when: { has_renewables: true, has_gas_boiler: false },
      enabled: true
    }
  ]
};

/**
 * SCENARIO: Unreachable action — include_when requires a fact with no source
 *
 *   fact: uses_solar (boolean, no question, no rule that sets it true)
 *   action_1: include_when = { uses_solar: true }
 *
 *   uses_solar can never become true → action_1 is unreachable.
 *   Expected: 1 unreachable-actions warning on action_1.
 */
const unreachableActionData: DatasetData = {
  facts: {
    uses_solar: { type: "boolean_state", core: true, enabled: true }
  },
  constants: {},
  questions: [],
  rules: [],
  action_conditions: {
    action_solar: {
      enabled: true,
      include_when: { uses_solar: true },
      exclude_when: {}
    }
  }
};

/**
 * SCENARIO: Reachable action — same setup, but with a question that sets the fact
 *
 *   Expected: 0 unreachable-actions warnings.
 */
const reachableActionData: DatasetData = {
  ...unreachableActionData,
  questions: [{ type: "boolean_state", label: "Do you use solar?", fact: "uses_solar", enabled: true }]
};

/**
 * SCENARIO: Unreachable action — logically impossible condition (requires A=true AND A=false)
 *
 *   fact: has_office (boolean, set by question)
 *   action_2: include_when = { has_office: true, has_office: false }
 *
 *   No user state can satisfy this — the last key wins in JSON, so in practice this
 *   degenerates to a single condition, but the intent is to document an impossible AND.
 *   This tests that the SAT solver correctly reports unsatisfiability.
 *
 *   NOTE: Because JS objects deduplicate keys, has_office: false wins.
 *   The action requires has_office=false, which IS satisfiable (user doesn't have an office).
 *   So this is actually reachable — the scenario documents the JS key-dedup gotcha.
 *   Expected: 0 issues (the condition collapses to has_office: false).
 */
const impossibleConditionData: DatasetData = {
  facts: {
    has_office: { type: "boolean_state", core: true, enabled: true }
  },
  constants: {},
  questions: [{ type: "boolean_state", label: "Do you have an office?", fact: "has_office", enabled: true }],
  rules: [],
  action_conditions: {
    action_impossible: {
      enabled: true,
      // JS deduplicates keys: this is equivalent to { has_office: false }
      include_when: { has_office: true, ...{ has_office: false } } as { has_office: boolean },
      exclude_when: {}
    }
  }
};

/**
 * SCENARIO: Dead fact referenced via any_of inside an any condition
 *
 *   fact: active_fact (set by question)
 *   fact: any_of_fact (referenced only via { any: [{ any_of: ["any_of_fact"] }] } in a rule)
 *   Expected: 0 dead-facts warnings (any_of_fact is referenced).
 */
const deadFactAnyOfData: DatasetData = {
  facts: {
    active_fact: { type: "boolean_state", core: true, enabled: true },
    any_of_fact: { type: "boolean_state", core: true, enabled: true }
  },
  constants: {},
  questions: [{ type: "boolean_state", label: "Q", fact: "active_fact", enabled: true }],
  rules: [
    {
      sets: "active_fact",
      value: true,
      source: "general",
      when: { any: [{ any_of: ["any_of_fact"] }] },
      enabled: true
    }
  ],
  action_conditions: {}
};

/**
 * SCENARIO: Dead fact — defined but never referenced anywhere
 *
 *   fact: legacy_metric (boolean, enabled, no questions/rules/action_conditions reference it)
 *   Expected: 1 dead-facts warning on legacy_metric.
 */
const deadFactData: DatasetData = {
  facts: {
    active_fact: { type: "boolean_state", core: true, enabled: true },
    legacy_metric: { type: "boolean_state", core: false, enabled: true }
  },
  constants: {},
  questions: [{ type: "boolean_state", label: "Q", fact: "active_fact", enabled: true }],
  rules: [],
  action_conditions: {
    action_1: { enabled: true, include_when: { active_fact: true }, exclude_when: {} }
  }
};

/**
 * SCENARIO: Undefined reference — rule's when condition references a non-existent fact
 *
 *   rule: sets active_fact=true when { typo_fact: true }
 *   typo_fact doesn't exist.
 *   Expected: 1 undefined-refs error.
 */
const undefinedRefData: DatasetData = {
  facts: {
    active_fact: { type: "boolean_state", core: true, enabled: true }
  },
  constants: {},
  questions: [],
  rules: [{ sets: "active_fact", value: true, source: "general", when: { typo_fact: true }, enabled: true }],
  action_conditions: {}
};

/**
 * SCENARIO: Include/exclude overlap — same condition in both include_when and exclude_when
 *
 *   fact: has_fleet (boolean, set by question)
 *   action_fleet: include_when = { has_fleet: true }, exclude_when = { has_fleet: true }
 *
 *   A user that satisfies include also satisfies exclude → always excluded.
 *   Expected: 1 include-exclude-overlap error on action_fleet.
 */
const includeExcludeOverlapData: DatasetData = {
  facts: {
    has_fleet: { type: "boolean_state", core: true, enabled: true }
  },
  constants: {},
  questions: [{ type: "boolean_state", label: "Do you have a fleet?", fact: "has_fleet", enabled: true }],
  rules: [],
  action_conditions: {
    action_fleet: {
      enabled: true,
      include_when: { has_fleet: true },
      exclude_when: { has_fleet: true }
    }
  }
};

// ── Scenario assertions ───────────────────────────────────

describe("analysis scenario: contradictory rules", () => {
  it("detects contradiction when two rules can both fire with different values", () => {
    const found = issues(contradictoryRulesData, "contradictory-rules");
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain("heating_type");
  });

  it("reports no contradiction when conditions are mutually exclusive", () => {
    expect(issues(exclusiveRulesData, "contradictory-rules")).toHaveLength(0);
  });

  it("does not flag a hotspot not_applicable rule overlapping a general true rule", () => {
    // This is the real-world cat_15_relevant pattern: hotspot suppression co-existing
    // with a general derivation. Overlapping conditions are intentional here.
    expect(issues(hotspotSuppressionData, "contradictory-rules")).toHaveLength(0);
  });
});

describe("analysis scenario: unreachable actions", () => {
  it("flags action whose include_when requires a fact that can never be set", () => {
    const found = issues(unreachableActionData, "unreachable-actions");
    expect(found).toHaveLength(1);
    expect(found[0].refs[0].id).toBe("action_solar");
    expect(found[0].conditions?.[0].sourcelessFacts).toContain("uses_solar");
  });

  it("does not flag action when the required fact has a question source", () => {
    expect(issues(reachableActionData, "unreachable-actions")).toHaveLength(0);
  });

  it("documents JS key-dedup gotcha: duplicate keys collapse to last value", () => {
    // { has_office: true, has_office: false } → { has_office: false }
    // which IS satisfiable, so no unreachable warning
    expect(issues(impossibleConditionData, "unreachable-actions")).toHaveLength(0);
  });
});

describe("analysis scenario: dead facts", () => {
  it("flags a fact that is never referenced by questions, rules, or action conditions", () => {
    const found = issues(deadFactData, "dead-facts");
    expect(found.some((i) => i.refs.some((r) => r.id === "legacy_metric"))).toBe(true);
    expect(found.some((i) => i.refs.some((r) => r.id === "active_fact"))).toBe(false);
  });

  it("does not flag a fact referenced via any_of inside an any condition", () => {
    const found = issues(deadFactAnyOfData, "dead-facts");
    expect(found.some((i) => i.refs.some((r) => r.id === "any_of_fact"))).toBe(false);
  });
});

describe("analysis scenario: undefined references", () => {
  it("flags a rule whose when condition references a non-existent fact", () => {
    const found = issues(undefinedRefData, "undefined-refs");
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain("typo_fact");
  });
});

describe("analysis scenario: include/exclude overlap", () => {
  it("flags an action whose include and exclude conditions can both be satisfied", () => {
    const found = issues(includeExcludeOverlapData, "include-exclude-overlap");
    expect(found).toHaveLength(1);
    expect(found[0].refs.some((r) => r.id === "action_fleet")).toBe(true);
  });
});
