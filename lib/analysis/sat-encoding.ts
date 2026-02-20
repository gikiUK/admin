import type { FormulaOrTerm, Solver } from "logic-solver";
import Logic from "logic-solver";
import type {
  AnyCondition,
  BlobCondition,
  BlobConstantValue,
  BlobFact,
  DatasetData,
  SimpleCondition
} from "@/lib/blob/types";

export type SatModel = {
  solver: Solver;
  vars: Set<string>;
  /** Maps "factId:numericId" → "factId:name" for resolving numeric constant refs */
  idToName: Map<string, string>;
};

function factVar(id: string, suffix: string): string {
  return `fact:${id}:${suffix}`;
}

function resolveConstantNames(valuesRef: string, constants: Record<string, BlobConstantValue[]>): string[] {
  const group = constants[valuesRef];
  if (!group) return [];
  return group.filter((c) => c.enabled).map((c) => c.name);
}

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

export function buildSatModel(data: DatasetData): SatModel {
  const solver = new Logic.Solver();
  const vars = new Set<string>();
  const idToName = buildIdToNameMap(data);

  for (const [id, fact] of Object.entries(data.facts)) {
    if (!fact.enabled) continue;
    encodeFact(id, fact, data.constants, solver, vars);
  }

  // Collect facts that have a source (question or rule that can set them to a positive value)
  const factsWithSource = new Set<string>();

  // Questions are a source for the facts they set
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
    const fact = data.facts[rule.sets];
    if (!fact?.enabled) continue;

    // Rules that set a value (true, enum value) are a source
    if (rule.value === true || (typeof rule.value === "string" && rule.value !== "not_applicable")) {
      factsWithSource.add(rule.sets);
    }

    const whenFormula = encodeCondition(rule.when, vars, idToName);
    if (!whenFormula) continue;

    let effect: FormulaOrTerm;
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

  // Constrain facts with no source — they can never become true/have a value
  for (const [id, fact] of Object.entries(data.facts)) {
    if (!fact.enabled) continue;
    if (factsWithSource.has(id)) continue;

    if (fact.type === "boolean_state") {
      solver.forbid(factVar(id, "true"));
    } else {
      const names = fact.values_ref ? resolveConstantNames(fact.values_ref, data.constants) : [];
      for (const name of names) {
        solver.forbid(factVar(id, `val:${name}`));
      }
    }
  }

  return { solver, vars, idToName };
}

function encodeFact(
  id: string,
  fact: BlobFact,
  constants: Record<string, BlobConstantValue[]>,
  solver: Solver,
  vars: Set<string>
) {
  const trueVar = factVar(id, "true");
  const naVar = factVar(id, "na");
  vars.add(trueVar);
  vars.add(naVar);

  if (fact.type === "boolean_state") {
    solver.require(Logic.atMostOne(trueVar, naVar));
  } else if (fact.type === "enum") {
    const names = fact.values_ref ? resolveConstantNames(fact.values_ref, constants) : [];
    const valVars = names.map((name) => {
      const v = factVar(id, `val:${name}`);
      vars.add(v);
      return v;
    });
    solver.require(Logic.atMostOne(...valVars, naVar));
  } else if (fact.type === "array") {
    const names = fact.values_ref ? resolveConstantNames(fact.values_ref, constants) : [];
    for (const name of names) {
      const v = factVar(id, `val:${name}`);
      vars.add(v);
    }
    const valVars = names.map((name) => factVar(id, `val:${name}`));
    if (valVars.length > 0) {
      solver.require(Logic.implies(naVar, Logic.not(Logic.or(...valVars))));
    }
  }
}

export function encodeCondition(
  condition: BlobCondition,
  vars: Set<string>,
  idToName: Map<string, string>
): FormulaOrTerm | null {
  if ("any" in condition) {
    const subs = (condition as AnyCondition).any
      .map((c) => encodeCondition(c, vars, idToName))
      .filter(Boolean) as FormulaOrTerm[];
    return subs.length > 0 ? Logic.or(...subs) : null;
  }

  const simple = condition as SimpleCondition;
  const parts: FormulaOrTerm[] = [];

  for (const [key, value] of Object.entries(simple)) {
    if (key === "any_of" && Array.isArray(value)) {
      const factVars = (value as string[]).map((f) => factVar(f, "true"));
      if (factVars.length > 0) parts.push(Logic.or(...factVars));
      continue;
    }

    const encoded = encodeKeyValue(key, value, idToName);
    if (encoded) parts.push(encoded);
  }

  if (parts.length === 0) return null;
  return parts.length === 1 ? parts[0] : Logic.and(...parts);
}

/** Resolve a value to its canonical name. Numeric IDs get looked up in the idToName map. */
function resolveValueName(factKey: string, value: string | number, idToName: Map<string, string>): string {
  if (typeof value === "number") {
    return idToName.get(`${factKey}:${value}`) ?? String(value);
  }
  return value;
}

function encodeKeyValue(
  key: string,
  value: string | boolean | number | number[] | string[],
  idToName: Map<string, string>
): FormulaOrTerm | null {
  if (typeof value === "boolean") {
    const v = factVar(key, "true");
    return value ? v : Logic.not(v);
  }

  if (value === "not_applicable") {
    return factVar(key, "na");
  }

  if (typeof value === "string") {
    return factVar(key, `val:${value}`);
  }

  if (Array.isArray(value)) {
    const valVars = (value as (string | number)[]).map((v) => {
      const name = resolveValueName(key, v, idToName);
      return factVar(key, `val:${name}`);
    });
    return valVars.length > 0 ? Logic.or(...valVars) : null;
  }

  return null;
}
