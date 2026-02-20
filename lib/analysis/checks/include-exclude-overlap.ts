import Logic from "logic-solver";
import type { DatasetData } from "@/lib/blob/types";
import type { SatModel } from "../sat-encoding";
import { encodeCondition } from "../sat-encoding";
import type { CheckResult } from "../types";

export function checkIncludeExcludeOverlap(data: DatasetData, model: SatModel): CheckResult {
  const issues: CheckResult["issues"] = [];

  for (const [actionId, ac] of Object.entries(data.action_conditions)) {
    if (!ac.enabled) continue;

    // Skip if either condition is empty
    if (Object.keys(ac.include_when).length === 0) continue;
    if (Object.keys(ac.exclude_when).length === 0) continue;

    const includeFormula = encodeCondition(ac.include_when, model.vars, model.idToName);
    const excludeFormula = encodeCondition(ac.exclude_when, model.vars, model.idToName);
    if (!includeFormula || !excludeFormula) continue;

    // Can both be true simultaneously?
    const both = Logic.and(includeFormula, excludeFormula);
    const solution = model.solver.solveAssuming(both);

    if (solution) {
      issues.push({
        severity: "warning",
        message: `include_when and exclude_when conditions can both be true simultaneously`,
        suggestion: `Some users will match both conditions, making the result ambiguous. Narrow either the include_when or exclude_when so they don't overlap.`,
        refs: [{ type: "action", id: actionId }],
        conditions: [
          { tag: "include_when", condition: ac.include_when },
          { tag: "exclude_when", condition: ac.exclude_when }
        ]
      });
    }
  }

  return {
    id: "include-exclude-overlap",
    name: "Include/Exclude Overlap",
    description: "Actions where include_when and exclude_when can both be true at the same time",
    issues
  };
}
