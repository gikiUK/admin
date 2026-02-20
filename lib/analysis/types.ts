export type IssueSeverity = "error" | "warning";

export type IssueRef = {
  type: "fact" | "question" | "rule" | "action" | "constant";
  id: string;
  label?: string;
};

export type ConditionTag = "show_when" | "hide_when" | "include_when" | "exclude_when";

export type IssueCondition = {
  tag: ConditionTag;
  condition: import("@/lib/blob/types").BlobCondition;
  /** Fact IDs in this condition that have no source (no question or rule sets them) */
  sourcelessFacts?: string[];
};

export type AnalysisIssue = {
  severity: IssueSeverity;
  message: string;
  suggestion?: string;
  refs: IssueRef[];
  /** When set, the issue row renders condition badge(s) */
  conditions?: IssueCondition[];
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
