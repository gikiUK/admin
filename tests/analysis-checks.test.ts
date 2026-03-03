import { checkContradictoryRules } from "@/lib/analysis/checks/contradictory-rules";
import { checkUndefinedRefs } from "@/lib/analysis/checks/undefined-refs";
import { checkUnreachableActions } from "@/lib/analysis/checks/unreachable-actions";
import { buildSatModel } from "@/lib/analysis/sat-encoding";
import { findSourcelessFacts } from "@/lib/analysis/sourceless-facts";
import type { DatasetData } from "@/lib/blob/types";

// ── Fixtures ─────────────────────────────────────────────

function makeData(overrides: Partial<DatasetData> = {}): DatasetData {
  return {
    facts: {},
    questions: [],
    rules: [],
    constants: {},
    action_conditions: {},
    ...overrides
  };
}

// ── findSourcelessFacts ───────────────────────────────────

describe("findSourcelessFacts", () => {
  it("returns empty for empty fact list", () => {
    expect(findSourcelessFacts([], makeData())).toEqual([]);
  });

  it("fact with no question or rule is sourceless", () => {
    const data = makeData({ facts: { heat_pump: { type: "boolean_state", core: true, enabled: true } } });
    expect(findSourcelessFacts(["heat_pump"], data)).toEqual(["heat_pump"]);
  });

  it("fact set by enabled question is not sourceless", () => {
    const data = makeData({
      facts: { heat_pump: { type: "boolean_state", core: true, enabled: true } },
      questions: [{ type: "boolean_state", label: "Q", fact: "heat_pump", enabled: true }]
    });
    expect(findSourcelessFacts(["heat_pump"], data)).toEqual([]);
  });

  it("fact set only by rule with value=false is sourceless", () => {
    const data = makeData({
      facts: { heat_pump: { type: "boolean_state", core: true, enabled: true } },
      rules: [{ sets: "heat_pump", value: false, source: "general", when: {}, enabled: true }]
    });
    expect(findSourcelessFacts(["heat_pump"], data)).toEqual(["heat_pump"]);
  });

  it("fact set only by not_applicable rule is sourceless (matches SAT model)", () => {
    const data = makeData({
      facts: { heat_pump: { type: "boolean_state", core: true, enabled: true } },
      rules: [{ sets: "heat_pump", value: "not_applicable", source: "general", when: {}, enabled: true }]
    });
    // not_applicable is not a real positive source — consistent with sat-encoding.ts
    expect(findSourcelessFacts(["heat_pump"], data)).toEqual(["heat_pump"]);
  });

  it("fact set by rule with value=true is not sourceless", () => {
    const data = makeData({
      facts: { heat_pump: { type: "boolean_state", core: true, enabled: true } },
      rules: [{ sets: "heat_pump", value: true, source: "general", when: {}, enabled: true }]
    });
    expect(findSourcelessFacts(["heat_pump"], data)).toEqual([]);
  });

  it("disabled fact is excluded even if unreferenced", () => {
    const data = makeData({ facts: { heat_pump: { type: "boolean_state", core: true, enabled: false } } });
    expect(findSourcelessFacts(["heat_pump"], data)).toEqual([]);
  });

  it("rule with disabled question still counts as sourceless", () => {
    const data = makeData({
      facts: { heat_pump: { type: "boolean_state", core: true, enabled: true } },
      questions: [{ type: "boolean_state", label: "Q", fact: "heat_pump", enabled: false }]
    });
    expect(findSourcelessFacts(["heat_pump"], data)).toEqual(["heat_pump"]);
  });
});

// ── checkUndefinedRefs ────────────────────────────────────

describe("checkUndefinedRefs", () => {
  it("returns no issues for clean data", () => {
    const data = makeData({
      facts: { heat_pump: { type: "boolean_state", core: true, enabled: true } },
      questions: [
        { type: "boolean_state", label: "Q", fact: "heat_pump", show_when: { heat_pump: true }, enabled: true }
      ]
    });
    expect(checkUndefinedRefs(data).issues).toHaveLength(0);
  });

  it("flags rule referencing undefined fact in when condition", () => {
    const data = makeData({
      facts: { heat_pump: { type: "boolean_state", core: true, enabled: true } },
      rules: [{ sets: "heat_pump", value: true, source: "general", when: { ghost_fact: true }, enabled: true }]
    });
    const result = checkUndefinedRefs(data);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].message).toContain("ghost_fact");
  });

  it("flags undefined fact inside any condition", () => {
    const data = makeData({
      facts: { heat_pump: { type: "boolean_state", core: true, enabled: true } },
      rules: [
        {
          sets: "heat_pump",
          value: true,
          source: "general",
          when: { any: [{ ghost_fact: true }] },
          enabled: true
        }
      ]
    });
    const result = checkUndefinedRefs(data);
    expect(result.issues.some((i) => i.message.includes("ghost_fact"))).toBe(true);
  });

  it("flags undefined fact inside any_of array", () => {
    const data = makeData({
      facts: { heat_pump: { type: "boolean_state", core: true, enabled: true } },
      action_conditions: {
        action_1: {
          enabled: true,
          include_when: { any_of: ["heat_pump", "undefined_fact"] },
          exclude_when: {}
        }
      }
    });
    const result = checkUndefinedRefs(data);
    expect(result.issues.some((i) => i.message.includes("undefined_fact"))).toBe(true);
    expect(result.issues.some((i) => i.message.includes("heat_pump"))).toBe(false);
  });

  it("flags disabled fact reference in any_of", () => {
    const data = makeData({
      facts: {
        heat_pump: { type: "boolean_state", core: true, enabled: true },
        old_fact: { type: "boolean_state", core: true, enabled: false }
      },
      action_conditions: {
        action_1: {
          enabled: true,
          include_when: { any_of: ["heat_pump", "old_fact"] },
          exclude_when: {}
        }
      }
    });
    const result = checkUndefinedRefs(data);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].message).toContain("disabled");
    expect(result.issues[0].message).toContain("old_fact");
  });

  it("returns no issues for empty data", () => {
    expect(checkUndefinedRefs(makeData()).issues).toHaveLength(0);
  });
});

// ── SAT model: any_of variable registration ───────────────

describe("buildSatModel — any_of vars registration", () => {
  it("registers any_of fact variables in vars Set", () => {
    const data = makeData({
      facts: {
        fact_a: { type: "boolean_state", core: true, enabled: true },
        fact_b: { type: "boolean_state", core: true, enabled: true }
      },
      rules: [
        {
          sets: "fact_a",
          value: true,
          source: "general",
          when: { any_of: ["fact_a", "fact_b"] },
          enabled: true
        }
      ]
    });
    const model = buildSatModel(data);
    // Both fact vars should be present (they were encoded via any_of)
    expect(model.vars.has("fact:fact_a:true")).toBe(true);
    expect(model.vars.has("fact:fact_b:true")).toBe(true);
  });
});

// ── checkContradictoryRules ───────────────────────────────

describe("checkContradictoryRules", () => {
  it("returns no issues for empty data", () => {
    const data = makeData();
    const model = buildSatModel(data);
    expect(checkContradictoryRules(data, model).issues).toHaveLength(0);
  });

  it("does not flag rules that can never overlap because conditions are exclusive", () => {
    // Rule A fires only when cond_a is true and cond_b is false
    // Rule B fires only when cond_b is true and cond_a is false
    // Conditions are mutually exclusive → no issue
    const data = makeData({
      facts: {
        cond_a: { type: "boolean_state", core: true, enabled: true },
        cond_b: { type: "boolean_state", core: true, enabled: true },
        result: { type: "enum", core: true, enabled: true, values_ref: "temperatures" }
      },
      constants: {
        temperatures: [
          { id: 1, name: "hot", description: null, enabled: true },
          { id: 2, name: "cold", description: null, enabled: true }
        ]
      },
      questions: [
        { type: "boolean_state", label: "A", fact: "cond_a", enabled: true },
        { type: "boolean_state", label: "B", fact: "cond_b", enabled: true }
      ],
      rules: [
        { sets: "result", value: "hot", source: "general", when: { cond_a: true, cond_b: false }, enabled: true },
        { sets: "result", value: "cold", source: "general", when: { cond_b: true, cond_a: false }, enabled: true }
      ]
    });
    const model = buildSatModel(data);
    expect(checkContradictoryRules(data, model).issues).toHaveLength(0);
  });

  it("does not flag two rules setting same fact to the same value", () => {
    const data = makeData({
      facts: {
        trigger: { type: "boolean_state", core: true, enabled: true },
        result: { type: "boolean_state", core: true, enabled: true }
      },
      questions: [
        { type: "boolean_state", label: "Q", fact: "trigger", enabled: true },
        { type: "boolean_state", label: "Q2", fact: "result", enabled: true }
      ],
      rules: [
        { sets: "result", value: true, source: "general", when: { trigger: true }, enabled: true },
        { sets: "result", value: true, source: "general", when: { trigger: true }, enabled: true }
      ]
    });
    const model = buildSatModel(data);
    expect(checkContradictoryRules(data, model).issues).toHaveLength(0);
  });
});

// ── checkUnreachableActions ───────────────────────────────

describe("checkUnreachableActions", () => {
  it("returns no issues for empty data", () => {
    const data = makeData();
    const model = buildSatModel(data);
    expect(checkUnreachableActions(data, model).issues).toHaveLength(0);
  });

  it("returns no issues when include_when is empty", () => {
    const data = makeData({
      action_conditions: {
        action_1: { enabled: true, include_when: {}, exclude_when: {} }
      }
    });
    const model = buildSatModel(data);
    expect(checkUnreachableActions(data, model).issues).toHaveLength(0);
  });

  it("flags action whose include_when requires a sourceless fact", () => {
    // fact_a has no question or rule — it can never become true
    const data = makeData({
      facts: { fact_a: { type: "boolean_state", core: true, enabled: true } },
      action_conditions: {
        action_1: { enabled: true, include_when: { fact_a: true }, exclude_when: {} }
      }
    });
    const model = buildSatModel(data);
    const result = checkUnreachableActions(data, model);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].conditions?.[0].sourcelessFacts).toContain("fact_a");
  });

  it("skips disabled action conditions", () => {
    const data = makeData({
      facts: { fact_a: { type: "boolean_state", core: true, enabled: true } },
      action_conditions: {
        action_1: { enabled: false, include_when: { fact_a: true }, exclude_when: {} }
      }
    });
    const model = buildSatModel(data);
    expect(checkUnreachableActions(data, model).issues).toHaveLength(0);
  });

  it("action using any_of with a sourceable fact is reachable", () => {
    const data = makeData({
      facts: { fact_a: { type: "boolean_state", core: true, enabled: true } },
      questions: [{ type: "boolean_state", label: "Q", fact: "fact_a", enabled: true }],
      action_conditions: {
        action_1: { enabled: true, include_when: { any_of: ["fact_a"] }, exclude_when: {} }
      }
    });
    const model = buildSatModel(data);
    expect(checkUnreachableActions(data, model).issues).toHaveLength(0);
  });
});
