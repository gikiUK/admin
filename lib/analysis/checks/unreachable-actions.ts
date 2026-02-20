import type { DatasetData } from "@/lib/blob/types";
import type { SatModel } from "../sat-encoding";
import { encodeCondition } from "../sat-encoding";
import type { CheckResult } from "../types";

export function checkUnreachableActions(data: DatasetData, model: SatModel): CheckResult {
  const issues: CheckResult["issues"] = [];

  for (const [actionId, ac] of Object.entries(data.action_conditions)) {
    if (!ac.enabled) continue;

    // Empty include_when matches everything — skip
    if (Object.keys(ac.include_when).length === 0) continue;

    const formula = encodeCondition(ac.include_when, model.vars, model.idToName);
    if (!formula) continue;

    const solution = model.solver.solveAssuming(formula);
    if (!solution) {
      issues.push({
        severity: "warning",
        message: `Action ${actionId} has an include_when condition that can never be satisfied`,
        suggestion: `No combination of user answers can match this condition. The condition may reference values that conflict with each other, or facts that have no source. Review the include_when or disable this action condition.`,
        refs: [{ type: "action", id: actionId }]
      });
    }
  }

  return {
    id: "unreachable-actions",
    name: "Unreachable Actions",
    description: "Actions whose include_when condition can never be satisfied",
    issues
  };
}
