import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { AnalysisReport } from "@/lib/analysis/types";
import { CheckResultCard } from "./check-result-card";

export function AnalysisPanel({ report }: { report: AnalysisReport }) {
  return (
    <div className="space-y-4">
      <SummaryBar report={report} />
      <div className="space-y-3">
        {report.checks.map((check) => (
          <CheckResultCard key={check.id} result={check} />
        ))}
      </div>
    </div>
  );
}

function SummaryBar({ report }: { report: AnalysisReport }) {
  const { checks, totalIssues, errorCount, warningCount } = report;

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3">
      <span className="text-sm font-medium">{checks.length} checks</span>
      <span className="text-muted-foreground">|</span>
      {totalIssues === 0 ? (
        <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          All clear
        </span>
      ) : (
        <span className="flex items-center gap-3 text-sm">
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="size-4" />
              {errorCount} error{errorCount !== 1 ? "s" : ""}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" />
              {warningCount} warning{warningCount !== 1 ? "s" : ""}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
