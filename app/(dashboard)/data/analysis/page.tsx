"use client";

import { Loader2, Play, RotateCw } from "lucide-react";
import { AnalysisPanel } from "@/components/analysis/analysis-panel";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/lib/analysis/analysis-context";
import { useDataset } from "@/lib/blob/use-dataset";

export default function AnalysisPage() {
  const { blob, isEditing } = useDataset();
  const { report, running, rerun } = useAnalysis();

  if (!blob) {
    return <p className="py-8 text-center text-muted-foreground">Loading dataset...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis"
        description={`Analysing ${isEditing ? "draft" : "live"} dataset for contradictions, dead references, and unreachable conditions.`}
        action={
          <Button onClick={rerun} disabled={running} variant="outline">
            {running ? <Loader2 className="animate-spin" /> : <RotateCw />}
            {running ? "Running..." : "Re-run"}
          </Button>
        }
      />
      {report ? (
        <AnalysisPanel report={report} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-muted-foreground">
          {running ? <Loader2 className="size-8 animate-spin" /> : <Play className="size-8" />}
          <p className="text-sm">{running ? "Running analysis..." : "Analysis will run automatically..."}</p>
        </div>
      )}
    </div>
  );
}
