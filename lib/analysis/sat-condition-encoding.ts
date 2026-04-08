import type { FormulaOrTerm } from "logic-solver";
import Logic from "logic-solver";
import type { BlobCondition, SimpleCondition } from "@/lib/blob/types";

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

// Normalize a sub-condition entry: strings are shorthand for { fact: true }.
function normalizeSubCondition(sub: unknown): BlobCondition {
  return typeof sub === "string" ? { [sub]: true } : (sub as BlobCondition);
}

export function encodeCondition(
  condition: BlobCondition,
  vars: Set<string>,
  idToName: Map<string, string>
): FormulaOrTerm | null {
  const parts: FormulaOrTerm[] = [];

  for (const [key, value] of Object.entries(condition)) {
    if ((key === "any" || key === "any_of") && Array.isArray(value)) {
      const subs = value
        .map((sub) => encodeCondition(normalizeSubCondition(sub), vars, idToName))
        .filter(Boolean) as FormulaOrTerm[];
      if (subs.length > 0) parts.push(Logic.or(...subs));
      continue;
    }

    if (key === "all" && Array.isArray(value)) {
      const subs = value
        .map((sub) => encodeCondition(normalizeSubCondition(sub), vars, idToName))
        .filter(Boolean) as FormulaOrTerm[];
      if (subs.length > 0) parts.push(Logic.and(...subs));
      continue;
    }

    const encoded = encodeKeyValue(key, value as SimpleCondition[string], idToName);
    if (encoded) parts.push(encoded);
  }

  if (parts.length === 0) return null;
  return parts.length === 1 ? parts[0] : Logic.and(...parts);
}
