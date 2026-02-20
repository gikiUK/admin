"use client";

import { Loader2, Play, RotateCw } from "lucide-react";
import { useCallback, useState } from "react";
import { AnalysisPanel } from "@/components/analysis/analysis-panel";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { runAnalysis } from "@/lib/analysis/run-analysis";
import type { AnalysisReport } from "@/lib/analysis/types";
import { useDataset } from "@/lib/blob/use-dataset";

export default function AnalysisPage() {
  const { blob, isEditing } = useDataset();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(() => {
    if (!blob || running) return;
    setRunning(true);
    // Yield a frame so the spinner renders before the sync compute
    requestAnimationFrame(() => {
      const result = runAnalysis(blob);
      setReport(result);
      setRunning(false);
    });
  }, [blob, running]);

  if (!blob) {
    return <p className="py-8 text-center text-muted-foreground">Loading dataset...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis"
        description={`Analysing ${isEditing ? "draft" : "live"} dataset for contradictions, dead references, and unreachable conditions.`}
        action={
          <Button onClick={run} disabled={running} variant={report ? "outline" : "default"}>
            {running ? <Loader2 className="animate-spin" /> : report ? <RotateCw /> : <Play />}
            {running ? "Running..." : report ? "Re-run" : "Run analysis"}
          </Button>
        }
      />
      {report ? (
        <AnalysisPanel report={report} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-muted-foreground">
          {running ? <Loader2 className="size-8 animate-spin" /> : <Play className="size-8" />}
          <p className="text-sm">
            {running ? "Running analysis..." : 'Click "Run analysis" to check the dataset for issues.'}
          </p>
        </div>
      )}
    </div>
  );
}
