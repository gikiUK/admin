export type IssueSeverity = "error" | "warning";

export type IssueRef = {
  type: "fact" | "question" | "rule" | "action" | "constant";
  id: string;
  label?: string;
};

export type AnalysisIssue = {
  severity: IssueSeverity;
  message: string;
  suggestion?: string;
  refs: IssueRef[];
};

export type CheckResult = {
  id: string;
  name: string;
  description: string;
  issues: AnalysisIssue[];
};

export type AnalysisReport = {
  checks: CheckResult[];
  totalIssues: number;
  errorCount: number;
  warningCount: number;
};
