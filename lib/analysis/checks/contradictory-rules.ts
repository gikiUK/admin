import Logic from "logic-solver";
import type { DatasetData } from "@/lib/blob/types";
import type { SatModel } from "../sat-encoding";
import { encodeCondition } from "../sat-encoding";
import type { CheckResult } from "../types";

export function checkContradictoryRules(data: DatasetData, model: SatModel): CheckResult {
  const issues: CheckResult["issues"] = [];
  const enabledRules = data.rules
    .map((rule, index) => ({ rule, index }))
    .filter(({ rule }) => rule.enabled && data.facts[rule.sets]?.enabled);

  // Group rules by the fact they set
  const rulesByFact = new Map<string, typeof enabledRules>();
  for (const entry of enabledRules) {
    const key = entry.rule.sets;
    const list = rulesByFact.get(key) ?? [];
    list.push(entry);
    rulesByFact.set(key, list);
  }

  for (const [factId, rules] of rulesByFact) {
    // Check each pair of rules that set different values
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const a = rules[i];
        const b = rules[j];

        // Same value → not a contradiction
        if (a.rule.value === b.rule.value) continue;

        const condA = encodeCondition(a.rule.when, model.vars, model.idToName);
        const condB = encodeCondition(b.rule.when, model.vars, model.idToName);
        if (!condA || !condB) continue;

        // Can both conditions be true at the same time?
        const both = Logic.and(condA, condB);
        const solution = model.solver.solveAssuming(both);

        if (solution) {
          issues.push({
            severity: "error",
            message: `Rules #${a.index} and #${b.index} can both fire for "${factId}" with different values (${formatValue(a.rule.value)} vs ${formatValue(b.rule.value)})`,
            suggestion: `Make the conditions mutually exclusive so only one can fire, or disable one of the rules. Review both rules' "when" conditions to add a distinguishing constraint.`,
            refs: [
              { type: "rule", id: String(a.index), label: `Rule #${a.index}` },
              { type: "rule", id: String(b.index), label: `Rule #${b.index}` },
              { type: "fact", id: factId }
            ]
          });
        }
      }
    }
  }

  return {
    id: "contradictory-rules",
    name: "Contradictory Rules",
    description: "Rules that set the same fact to different values under overlapping conditions",
    issues
  };
}

function formatValue(value: boolean | string): string {
  if (typeof value === "boolean") return String(value);
  return `"${value}"`;
}
