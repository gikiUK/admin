import { checkUndefinedRefs } from "@/lib/analysis/checks/undefined-refs";
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

// ── checkUndefinedRefs: any + any_of combination ──────────

describe("checkUndefinedRefs — any containing any_of", () => {
  it("flags undefined fact inside any_of nested within any", () => {
    const data = makeData({
      facts: { heat_pump: { type: "boolean_state", core: true, enabled: true } },
      rules: [
        {
          sets: "heat_pump",
          value: true,
          source: "general",
          when: { any: [{ any_of: ["heat_pump", "ghost_fact"] }] },
          enabled: true
        }
      ]
    });
    const result = checkUndefinedRefs(data);
    expect(result.issues.some((i) => i.message.includes("ghost_fact"))).toBe(true);
    expect(result.issues.some((i) => i.message.includes("heat_pump"))).toBe(false);
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
