import type { BlobCondition } from "@/lib/blob/types";

// A BlobCondition is a flat hash where keys are either fact names or combinators ("any"/"all").
// Combinator values are arrays of sub-conditions: strings (shorthand for { fact: true })
// or nested condition objects. This mirrors the facts-engine evaluateCondition semantics.

/** Collect all fact IDs referenced in a condition, recursing into any/all sub-conditions. */
export function collectFactKeys(condition: BlobCondition, out: Set<string>): void {
  for (const [key, value] of Object.entries(condition)) {
    if ((key === "any" || key === "all" || key === "any_of") && Array.isArray(value)) {
      for (const sub of value) {
        if (typeof sub === "string") {
          out.add(sub);
        } else if (typeof sub === "object" && sub !== null) {
          collectFactKeys(sub as BlobCondition, out);
        }
      }
    } else {
      out.add(key);
    }
  }
}

/** Return all fact IDs referenced in a condition as an array. */
export function extractConditionFacts(condition: BlobCondition): string[] {
  const out = new Set<string>();
  collectFactKeys(condition, out);
  return [...out];
}
