import type { DatasetData } from "@/lib/blob/types";
import { extractConditionFacts } from "./condition-utils";

export { extractConditionFacts };

/** Return fact IDs that have no source - no enabled question or rule sets them */
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

    // Has a rule that derives it to true/a positive value (not false or not_applicable)?
    for (const rule of data.rules) {
      if (!rule.enabled) continue;
      if (rule.sets === id && rule.value !== false && rule.value !== "not_applicable") return false;
    }

    return true;
  });
}
