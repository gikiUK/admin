import Logic from "logic-solver";
import type { DatasetData } from "@/lib/blob/types";
import type { SatModel } from "../sat-encoding";
import { encodeCondition } from "../sat-encoding";
import { extractConditionFacts, findSourcelessFacts } from "../sourceless-facts";
import type { CheckResult } from "../types";

export function checkUnreachableQuestions(data: DatasetData, model: SatModel): CheckResult {
  const issues: CheckResult["issues"] = [];

  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];
    if (!q.enabled) continue;

    if (q.show_when) {
      const formula = encodeCondition(q.show_when, model.vars, model.idToName);
      if (formula) {
        const solution = model.solver.solveAssuming(formula);
        if (!solution) {
          const condFacts = extractConditionFacts(q.show_when);
          const sourceless = findSourcelessFacts(condFacts, data);
          const suggestion =
            sourceless.length > 0
              ? `The show_when depends on ${sourceless.map((f) => `"${f}"`).join(", ")} which ${sourceless.length === 1 ? "has" : "have"} no source — no enabled question or rule sets ${sourceless.length === 1 ? "it" : "them"}. Enable the relevant question or update the condition.`
              : `The combination of conditions in show_when is impossible given the current rules and constraints. Review the condition or disable this question.`;

          issues.push({
            severity: "warning",
            message: `show_when condition can never be satisfied`,
            suggestion,
            refs: [{ type: "question", id: String(i), label: q.label }],
            conditions: [{ tag: "show_when", condition: q.show_when, sourcelessFacts: sourceless }]
          });
          continue;
        }
      }
    }

    if (q.hide_when && !q.show_when) {
      const formula = encodeCondition(q.hide_when, model.vars, model.idToName);
      if (formula) {
        const negated = Logic.not(formula);
        const solution = model.solver.solveAssuming(negated);
        if (!solution) {
          const condFacts = extractConditionFacts(q.hide_when);
          const sourceless = findSourcelessFacts(condFacts, data);

          issues.push({
            severity: "warning",
            message: `hide_when condition is always true — question is always hidden`,
            suggestion: `The hide_when condition is satisfied for every possible state. Either update the condition or disable this question.`,
            refs: [{ type: "question", id: String(i), label: q.label }],
            conditions: [{ tag: "hide_when", condition: q.hide_when, sourcelessFacts: sourceless }]
          });
        }
      }
    }
  }

  return {
    id: "unreachable-questions",
    name: "Unreachable Questions",
    description: "Questions whose show_when can never be satisfied or hide_when is always true",
    issues
  };
}
