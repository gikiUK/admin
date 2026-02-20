"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { runAnalysis } from "@/lib/analysis/run-analysis";
import type { AnalysisReport } from "@/lib/analysis/types";
import { useDataset } from "@/lib/blob/use-dataset";

export function AnalysisIndicator() {
  const { blob, loading } = useDataset();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [running, setRunning] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!blob || loading) return;

    setRunning(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const result = runAnalysis(blob);
      setReport(result);
      setRunning(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [blob, loading]);

  if (loading || !blob) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/data/analysis"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"
          >
            {running ? (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            ) : !report ? null : report.totalIssues === 0 ? (
              <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <>
                {report.errorCount > 0 && (
                  <span className="flex items-center gap-0.5 text-destructive">
                    <AlertCircle className="size-3.5" />
                    {report.errorCount}
                  </span>
                )}
                {report.warningCount > 0 && (
                  <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="size-3.5" />
                    {report.warningCount}
                  </span>
                )}
              </>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          {running
            ? "Running analysis..."
            : !report
              ? "Analysis"
              : report.totalIssues === 0
                ? "All checks pass"
                : `${report.errorCount} error${report.errorCount !== 1 ? "s" : ""}, ${report.warningCount} warning${report.warningCount !== 1 ? "s" : ""}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
