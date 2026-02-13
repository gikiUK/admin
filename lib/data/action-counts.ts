import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DATA_DIR = resolve(process.cwd(), "..", "facts", "data");

type RawAction = {
  include_when: Record<string, unknown>;
  exclude_when: Record<string, unknown>;
};

function countRefs(condition: Record<string, unknown>, counts: Record<string, number>) {
  for (const [key, value] of Object.entries(condition)) {
    if (key === "any_of" && Array.isArray(value)) {
      for (const factId of value) {
        if (typeof factId === "string") {
          counts[factId] = (counts[factId] ?? 0) + 1;
        }
      }
    } else if (typeof value === "boolean") {
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
}

export function loadActionCounts(): Record<string, number> {
  const raw = readFileSync(resolve(DATA_DIR, "actions.json"), "utf-8");
  const actions = JSON.parse(raw) as RawAction[];
  const counts: Record<string, number> = {};

  for (const action of actions) {
    if (action.include_when) countRefs(action.include_when, counts);
    if (action.exclude_when) countRefs(action.exclude_when, counts);
  }

  return counts;
}
