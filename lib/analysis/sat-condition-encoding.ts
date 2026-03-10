import type { FormulaOrTerm } from "logic-solver";
import Logic from "logic-solver";
import type { AllCondition, AnyCondition, BlobCondition, SimpleCondition } from "@/lib/blob/types";

export function factVar(id: string, suffix: string): string {
  return `fact:${id}:${suffix}`;
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
  value: SimpleCondition[string],
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

  if ("all" in condition) {
    const subs = (condition as AllCondition).all
      .map((c) => encodeCondition(c, vars, idToName))
      .filter(Boolean) as FormulaOrTerm[];
    return subs.length > 0 ? Logic.and(...subs) : null;
  }

  const simple = condition as SimpleCondition;
  const parts: FormulaOrTerm[] = [];

  for (const [key, value] of Object.entries(simple)) {
    if (key === "any_of" && Array.isArray(value)) {
      const factVars = (value as string[]).map((f) => {
        const v = factVar(f, "true");
        vars.add(v);
        return v;
      });
      if (factVars.length > 0) parts.push(Logic.or(...factVars));
      continue;
    }

    const encoded = encodeKeyValue(key, value, idToName);
    if (encoded) parts.push(encoded);
  }

  if (parts.length === 0) return null;
  return parts.length === 1 ? parts[0] : Logic.and(...parts);
}
