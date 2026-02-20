import Logic from "logic-solver";
import type { AnyCondition, BlobCondition, DatasetData, SimpleCondition } from "@/lib/blob/types";
import type { SatModel } from "../sat-encoding";
import { encodeCondition } from "../sat-encoding";
import type { CheckResult } from "../types";

function extractConditionFacts(condition: BlobCondition): string[] {
  if ("any" in condition) {
    return (condition as AnyCondition).any.flatMap((c) => Object.keys(c));
  }
  return Object.keys(condition as SimpleCondition).filter((k) => k !== "any_of");
}

function findSourcelessFacts(factIds: string[], data: DatasetData): string[] {
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
      if (rule.sets === id && rule.value === true) return false;
    }

    return true;
  });
}

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
            message: `Question "${q.label}" has a show_when condition that can never be satisfied`,
            suggestion,
            refs: [{ type: "question", id: String(i), label: q.label }]
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
          issues.push({
            severity: "warning",
            message: `Question "${q.label}" has a hide_when condition that is always true — question is always hidden`,
            suggestion: `The hide_when condition is satisfied for every possible state. Either update the condition or disable this question.`,
            refs: [{ type: "question", id: String(i), label: q.label }]
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
