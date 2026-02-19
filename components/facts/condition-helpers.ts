import type { AnyCondition, BlobCondition, FactType, SimpleCondition } from "@/lib/blob/types";

export type ConditionMode = "single" | "and" | "or";

export function isAnyCondition(c: BlobCondition): c is AnyCondition {
  return "any" in c;
}

export function getMode(c: BlobCondition): ConditionMode {
  if (isAnyCondition(c)) return "or";
  return Object.keys(c).length > 1 ? "and" : "single";
}

function splitSimple(c: SimpleCondition): SimpleCondition[] {
  return Object.entries(c).map(([k, v]) => ({ [k]: v }));
}

function mergeSimple(conditions: SimpleCondition[]): SimpleCondition {
  const merged: SimpleCondition = {};
  for (const c of conditions) {
    for (const [k, v] of Object.entries(c)) {
      merged[k] = v;
    }
  }
  return merged;
}

export function getSubs(c: BlobCondition, mode: ConditionMode): SimpleCondition[] {
  if (mode === "or") return (c as AnyCondition).any;
  if (mode === "and") return splitSimple(c as SimpleCondition);
  return [c as SimpleCondition];
}

export function buildCondition(mode: ConditionMode, subs: SimpleCondition[]): BlobCondition {
  if (mode === "or") return { any: subs };
  if (mode === "and") return mergeSimple(subs);
  return subs[0] ?? { "": true };
}

export function getOperatorsForType(type?: FactType): { value: string; label: string }[] {
  if (type === "boolean_state") {
    return [
      { value: "true", label: "= true" },
      { value: "false", label: "= false" },
      { value: "not_applicable", label: "= not applicable" }
    ];
  }
  if (type === "enum" || type === "array") {
    return [
      { value: "array", label: "contains" },
      { value: "not_applicable", label: "= not applicable" }
    ];
  }
  return [
    { value: "true", label: "= true" },
    { value: "false", label: "= false" },
    { value: "not_applicable", label: "= not applicable" },
    { value: "array", label: "contains" }
  ];
}

export function defaultValueForType(type?: FactType): boolean | string | number[] {
  if (type === "enum" || type === "array") return [];
  return true;
}
