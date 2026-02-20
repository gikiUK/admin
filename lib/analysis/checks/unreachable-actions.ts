import type { DatasetData } from "@/lib/blob/types";
import type { SatModel } from "../sat-encoding";
import { encodeCondition } from "../sat-encoding";
import { extractConditionFacts, findSourcelessFacts } from "../sourceless-facts";
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
      const condFacts = extractConditionFacts(ac.include_when);
      const sourceless = findSourcelessFacts(condFacts, data);
      const suggestion =
        sourceless.length > 0
          ? `The include_when depends on ${sourceless.map((f) => `"${f}"`).join(", ")} which ${sourceless.length === 1 ? "has" : "have"} no source — no enabled question or rule sets ${sourceless.length === 1 ? "it" : "them"}. Enable the relevant question or update the condition.`
          : `No combination of user answers can match this condition. The condition may reference values that conflict with each other. Review the include_when or disable this action condition.`;

      issues.push({
        severity: "warning",
        message: `include_when condition can never be satisfied`,
        suggestion,
        refs: [{ type: "action", id: actionId }],
        conditions: [{ tag: "include_when", condition: ac.include_when, sourcelessFacts: sourceless }]
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
