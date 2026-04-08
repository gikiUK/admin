import { collectFactKeys, extractConditionFacts } from "@/lib/analysis/condition-utils";
import { encodeCondition, factVar } from "@/lib/analysis/sat-condition-encoding";
import type { BlobCondition } from "@/lib/blob/types";

describe("collectFactKeys", () => {
  it("flat fact keys", () => {
    const out = new Set<string>();
    collectFactKeys({ heat_pump: true, solar_panel: false } as BlobCondition, out);
    expect([...out].sort()).toEqual(["heat_pump", "solar_panel"]);
  });

  it("any combinator: string shorthand", () => {
    const out = new Set<string>();
    collectFactKeys({ any: ["fact_a", "fact_b"] } as BlobCondition, out);
    expect([...out].sort()).toEqual(["fact_a", "fact_b"]);
  });

  it("all combinator: object sub-conditions", () => {
    const out = new Set<string>();
    collectFactKeys({ all: [{ fact_a: true }, { fact_b: false }] } as BlobCondition, out);
    expect([...out].sort()).toEqual(["fact_a", "fact_b"]);
  });

  it("any_of combinator: string shorthand", () => {
    const out = new Set<string>();
    collectFactKeys({ any_of: ["fact_a", "fact_b"] } as BlobCondition, out);
    expect([...out].sort()).toEqual(["fact_a", "fact_b"]);
  });

  it("nested combinators", () => {
    const out = new Set<string>();
    collectFactKeys({ any: [{ all: ["inner_a", "inner_b"] }, "outer_c"] } as BlobCondition, out);
    expect([...out].sort()).toEqual(["inner_a", "inner_b", "outer_c"]);
  });

  it("empty condition", () => {
    const out = new Set<string>();
    collectFactKeys({} as BlobCondition, out);
    expect([...out]).toEqual([]);
  });
});

describe("extractConditionFacts", () => {
  it("flat condition", () => {
    const result = extractConditionFacts({ ev_charger: true } as BlobCondition);
    expect(result).toEqual(["ev_charger"]);
  });

  it("any_of with strings", () => {
    const result = extractConditionFacts({ any_of: ["fact_x", "fact_y"] } as BlobCondition);
    expect(result.sort()).toEqual(["fact_x", "fact_y"]);
  });

  it("deduplicates across combinators", () => {
    const result = extractConditionFacts({ any: ["fact_a", "fact_b"], fact_a: true } as BlobCondition);
    expect(result.sort()).toEqual(["fact_a", "fact_b"]);
  });
});

describe("encodeCondition - any_of", () => {
  it("any_of produces a non-null formula", () => {
    const vars = new Set<string>();
    const idToName = new Map<string, string>();
    const formula = encodeCondition({ any_of: ["fact_a", "fact_b"] } as BlobCondition, vars, idToName);
    expect(formula).not.toBeNull();
  });

  it("any_of formula string contains correct fact vars, not a spurious any_of var", () => {
    const vars = new Set<string>();
    const idToName = new Map<string, string>();
    const formula = encodeCondition({ any_of: ["fact_a", "fact_b"] } as BlobCondition, vars, idToName);
    const str = JSON.stringify(formula);
    expect(str).toContain(factVar("fact_a", "true"));
    expect(str).toContain(factVar("fact_b", "true"));
    expect(str).not.toContain("fact:any_of");
  });
});
