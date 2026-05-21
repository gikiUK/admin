import type { DatasetData } from "@gikiuk/facts-engine";
import { makeFactFormatter } from "@/lib/analytics/fact-formatter";

function buildData(overrides: Partial<DatasetData> = {}): DatasetData {
  return {
    facts: {},
    questions: [],
    rules: [],
    constants: {},
    action_conditions: {},
    ...overrides
  };
}

describe("makeFactFormatter", () => {
  test("resolves numeric constant id to human label via fact.values_ref", () => {
    // This is the original bug: cohort breakdown returned `value: 6` and the UI showed "6"
    // instead of "Small (1-10 employees)". The formatter must consult fact.values_ref → constants.
    const data = buildData({
      facts: {
        "org.size": { type: "enum", core: true, enabled: true, values_ref: "org_sizes" }
      },
      questions: [
        {
          key: "org_size",
          type: "single-select",
          label: "What is the size of your organization?",
          fact: "org.size",
          enabled: true
        }
      ],
      constants: {
        org_sizes: [
          { id: 6, name: "small", label: "Small (1-10 employees)", description: null, enabled: true },
          { id: 7, name: "medium", label: "Medium (11-50 employees)", description: null, enabled: true }
        ]
      }
    });

    const format = makeFactFormatter(data);
    expect(format("org.size", 6).valueLabel).toBe("Small (1-10 employees)");
    expect(format("org.size", 7).valueLabel).toBe("Medium (11-50 employees)");
  });

  test("falls back to constant name if no label", () => {
    const data = buildData({
      facts: { "org.size": { type: "enum", core: true, enabled: true, values_ref: "org_sizes" } },
      constants: {
        org_sizes: [{ id: 6, name: "small", description: null, enabled: true }]
      }
    });
    expect(makeFactFormatter(data)("org.size", 6).valueLabel).toBe("small");
  });

  test("returns raw id as string when constant is missing", () => {
    const data = buildData({
      facts: { "org.size": { type: "enum", core: true, enabled: true, values_ref: "org_sizes" } },
      constants: { org_sizes: [] }
    });
    expect(makeFactFormatter(data)("org.size", 99).valueLabel).toBe("99");
  });

  test("string values resolve via question.options", () => {
    const data = buildData({
      facts: { "org.tier": { type: "enum", core: true, enabled: true } },
      questions: [
        {
          key: "org_tier",
          type: "single-select",
          label: "Tier",
          fact: "org.tier",
          enabled: true,
          options: [
            { value: "free", label: "Free tier" },
            { value: "paid", label: "Paid tier" }
          ]
        }
      ]
    });
    expect(makeFactFormatter(data)("org.tier", "paid").valueLabel).toBe("Paid tier");
  });

  test("string values without option match are humanised", () => {
    const data = buildData({
      facts: { "org.misc": { type: "enum", core: true, enabled: true } }
    });
    expect(makeFactFormatter(data)("org.misc", "snake_case_value").valueLabel).toBe("Snake Case Value");
  });

  test("booleans → Yes/No", () => {
    const data = buildData();
    const format = makeFactFormatter(data);
    expect(format("anything", true).valueLabel).toBe("Yes");
    expect(format("anything", false).valueLabel).toBe("No");
  });

  test("null/undefined → em-dash", () => {
    const data = buildData();
    const format = makeFactFormatter(data);
    expect(format("anything", null).valueLabel).toBe("—");
    expect(format("anything", undefined).valueLabel).toBe("—");
  });

  test("arrays of numeric constant ids resolve and join", () => {
    const data = buildData({
      facts: { "org.sectors": { type: "array", core: true, enabled: true, values_ref: "sectors" } },
      constants: {
        sectors: [
          { id: 1, name: "tech", label: "Technology", description: null, enabled: true },
          { id: 2, name: "mfg", label: "Manufacturing", description: null, enabled: true }
        ]
      }
    });
    expect(makeFactFormatter(data)("org.sectors", [1, 2]).valueLabel).toBe("Technology, Manufacturing");
  });

  test("empty array → em-dash", () => {
    const data = buildData();
    expect(makeFactFormatter(data)("anything", []).valueLabel).toBe("—");
  });

  test("uses question.label as the fact display label", () => {
    const data = buildData({
      facts: { "org.size": { type: "enum", core: true, enabled: true } },
      questions: [
        {
          key: "org_size",
          type: "single-select",
          label: "What is the size of your organization?",
          fact: "org.size",
          enabled: true
        }
      ]
    });
    expect(makeFactFormatter(data)("org.size", null).label).toBe("What is the size of your organization?");
  });

  test("humanises fact key when no question is found", () => {
    const data = buildData();
    expect(makeFactFormatter(data)("org.some_thing", null).label).toBe("Some Thing");
  });

  test("indexes facts mentioned in question.facts (multi-fact question)", () => {
    const data = buildData({
      facts: {
        "org.a": { type: "boolean_state", core: true, enabled: true },
        "org.b": { type: "boolean_state", core: true, enabled: true }
      },
      questions: [
        {
          key: "combo",
          type: "multi-checkbox",
          label: "Combo question",
          facts: { "org.a": { value: true }, "org.b": { value: true } },
          enabled: true
        }
      ]
    });
    expect(makeFactFormatter(data)("org.a", null).label).toBe("Combo question");
    expect(makeFactFormatter(data)("org.b", null).label).toBe("Combo question");
  });
});
