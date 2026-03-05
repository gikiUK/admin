import type { Solver } from "logic-solver";
import Logic from "logic-solver";
import type { DatasetData } from "@/lib/blob/types";
import { encodeCondition, factVar } from "./sat-condition-encoding";
import { encodeFact, resolveConstantNames } from "./sat-fact-encoding";

export type SatModel = {
  solver: Solver;
  vars: Set<string>;
  /** Maps "factId:numericId" → "factId:name" for resolving numeric constant refs */
  idToName: Map<string, string>;
};

/** Build a map from numeric constant IDs to their names, scoped per fact */
function buildIdToNameMap(data: DatasetData): Map<string, string> {
  const map = new Map<string, string>();
  for (const [factId, fact] of Object.entries(data.facts)) {
    if (!fact.values_ref) continue;
    const group = data.constants[fact.values_ref];
    if (!group) continue;
    for (const c of group) {
      if (!c.enabled) continue;
      map.set(`${factId}:${c.id}`, c.name);
    }
  }
  return map;
}

function collectFactsWithSource(data: DatasetData): Set<string> {
  const factsWithSource = new Set<string>();
  for (const q of data.questions) {
    if (!q.enabled) continue;
    if (q.fact) factsWithSource.add(q.fact);
    if (q.facts) {
      for (const mapping of Object.values(q.facts)) {
        for (const key of Object.keys(mapping)) factsWithSource.add(key);
      }
    }
  }
  for (const rule of data.rules) {
    if (!rule.enabled) continue;
    if (rule.value === true || (typeof rule.value === "string" && rule.value !== "not_applicable")) {
      factsWithSource.add(rule.sets);
    }
  }
  return factsWithSource;
}

function forbidSourcelessFacts(data: DatasetData, factsWithSource: Set<string>, solver: Logic.Solver) {
  for (const [id, fact] of Object.entries(data.facts)) {
    if (!fact.enabled) continue;
    if (factsWithSource.has(id)) continue;
    if (fact.type === "boolean_state") {
      solver.forbid(factVar(id, "true"));
    } else {
      const names = fact.values_ref ? resolveConstantNames(fact.values_ref, data.constants) : [];
      for (const name of names) solver.forbid(factVar(id, `val:${name}`));
    }
  }
}

/**
 * Build a model encoding only fact type constraints and sourceless forbids - no rule implications.
 * Used by the contradictory-rules check to test whether two conditions can overlap without the
 * rule effects poisoning satisfiability (contradictory rules make the full model unsatisfiable,
 * which would prevent the check from ever firing).
 */
export function buildConditionModel(data: DatasetData): SatModel {
  const solver = new Logic.Solver();
  const vars = new Set<string>();
  const idToName = buildIdToNameMap(data);

  for (const [id, fact] of Object.entries(data.facts)) {
    if (!fact.enabled) continue;
    encodeFact(id, fact, data.constants, solver, vars);
  }

  forbidSourcelessFacts(data, collectFactsWithSource(data), solver);

  return { solver, vars, idToName };
}

export function buildSatModel(data: DatasetData): SatModel {
  const solver = new Logic.Solver();
  const vars = new Set<string>();
  const idToName = buildIdToNameMap(data);

  for (const [id, fact] of Object.entries(data.facts)) {
    if (!fact.enabled) continue;
    encodeFact(id, fact, data.constants, solver, vars);
  }

  const factsWithSource = collectFactsWithSource(data);

  for (const rule of data.rules) {
    if (!rule.enabled) continue;
    const fact = data.facts[rule.sets];
    if (!fact?.enabled) continue;

    const whenFormula = encodeCondition(rule.when, vars, idToName);
    if (!whenFormula) continue;

    let effect: Logic.FormulaOrTerm;
    if (rule.value === true) {
      effect = factVar(rule.sets, "true");
    } else if (rule.value === false) {
      effect = Logic.not(factVar(rule.sets, "true"));
    } else if (rule.value === "not_applicable") {
      effect = factVar(rule.sets, "na");
    } else {
      effect = factVar(rule.sets, `val:${rule.value}`);
    }

    solver.require(Logic.implies(whenFormula, effect));
  }

  forbidSourcelessFacts(data, factsWithSource, solver);

  return { solver, vars, idToName };
}
