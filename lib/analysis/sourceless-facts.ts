import type { AnyCondition, BlobCondition, DatasetData, SimpleCondition } from "@/lib/blob/types";

/** Extract all fact IDs referenced in a condition */
export function extractConditionFacts(condition: BlobCondition): string[] {
  if ("any" in condition) {
    return (condition as AnyCondition).any.flatMap((c) => Object.keys(c));
  }
  return Object.keys(condition as SimpleCondition).filter((k) => k !== "any_of");
}

/** Return fact IDs that have no source — no enabled question or rule sets them */
export function findSourcelessFacts(factIds: string[], data: DatasetData): string[] {
  return factIds.filter((id) => {
    const fact = data.facts[id];
    if (!fact?.enabled) return false;

    // Has an enabled question that sets it?
    for (const q of data.questions) {
      if (!q.enabled) continue;
      if (q.fact === id) return false;
      if (q.facts) {
        for (const mapping of Object.values(q.facts)) {
          if (id in mapping) return false;
        }
      }
    }

    // Has a rule that derives it to true?
    for (const rule of data.rules) {
      if (!rule.enabled) continue;
      if (rule.sets === id && rule.value !== false) return false;
    }

    return true;
  });
}
