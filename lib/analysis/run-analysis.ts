import type { DatasetData } from "@/lib/blob/types";
import {
  checkContradictoryRules,
  checkDeadFacts,
  checkIncludeExcludeOverlap,
  checkUndefinedRefs,
  checkUnreachableActions,
  checkUnreachableQuestions
} from "./checks";
import { buildSatModel } from "./sat-encoding";
import type { AnalysisReport } from "./types";

export function runAnalysis(data: DatasetData): AnalysisReport {
  const model = buildSatModel(data);

  const checks = [
    checkDeadFacts(data),
    checkUndefinedRefs(data),
    checkContradictoryRules(data, model),
    checkUnreachableQuestions(data, model),
    checkUnreachableActions(data, model),
    checkIncludeExcludeOverlap(data, model)
  ];

  let errorCount = 0;
  let warningCount = 0;
  for (const check of checks) {
    for (const issue of check.issues) {
      if (issue.severity === "error") errorCount++;
      else warningCount++;
    }
  }

  return {
    checks,
    totalIssues: errorCount + warningCount,
    errorCount,
    warningCount
  };
}
