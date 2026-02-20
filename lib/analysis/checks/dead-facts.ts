import type { AnyCondition, BlobCondition, DatasetData, SimpleCondition } from "@/lib/blob/types";
import type { CheckResult } from "../types";

function collectConditionKeys(condition: BlobCondition): Set<string> {
  const keys = new Set<string>();
  if ("any" in condition) {
    for (const sub of (condition as AnyCondition).any) {
      for (const k of Object.keys(sub)) keys.add(k);
    }
  } else {
    const simple = condition as SimpleCondition;
    for (const [key, value] of Object.entries(simple)) {
      if (key === "any_of" && Array.isArray(value)) {
        for (const f of value as string[]) keys.add(f);
      } else {
        keys.add(key);
      }
    }
  }
  return keys;
}

export function checkDeadFacts(data: DatasetData): CheckResult {
  const referenced = new Set<string>();

  // Facts referenced by questions
  for (const q of data.questions) {
    if (!q.enabled) continue;
    if (q.fact) referenced.add(q.fact);
    if (q.facts) {
      for (const mapping of Object.values(q.facts)) {
        for (const key of Object.keys(mapping)) referenced.add(key);
      }
    }
    if (q.show_when) for (const k of collectConditionKeys(q.show_when)) referenced.add(k);
    if (q.hide_when) for (const k of collectConditionKeys(q.hide_when)) referenced.add(k);
  }

  // Facts referenced by rules
  for (const rule of data.rules) {
    if (!rule.enabled) continue;
    referenced.add(rule.sets);
    for (const k of collectConditionKeys(rule.when)) referenced.add(k);
  }

  // Facts referenced by action conditions
  for (const ac of Object.values(data.action_conditions)) {
    if (!ac.enabled) continue;
    for (const k of collectConditionKeys(ac.include_when)) referenced.add(k);
    for (const k of collectConditionKeys(ac.exclude_when)) referenced.add(k);
  }

  const issues = Object.entries(data.facts)
    .filter(([id, fact]) => fact.enabled && !referenced.has(id))
    .map(([id]) => ({
      severity: "warning" as const,
      message: "never referenced by any question, rule, or action condition",
      suggestion: `If this fact is no longer needed, disable it. If it's reserved for future use, this warning is safe to ignore.`,
      refs: [{ type: "fact" as const, id }]
    }));

  return {
    id: "dead-facts",
    name: "Dead Facts",
    description: "Facts that are defined but never referenced anywhere",
    issues
  };
}
