import { AlertCircle, AlertTriangle, Lightbulb } from "lucide-react";
import Link from "next/link";
import type { AnalysisIssue } from "@/lib/analysis/types";

function refHref(ref: { type: string; id: string }): string | null {
  switch (ref.type) {
    case "fact":
      return `/data/facts/${ref.id}`;
    case "question":
      return `/data/questions#q-${ref.id}`;
    case "rule":
      return `/data/rules#r-${ref.id}`;
    case "action":
      return `/data/actions`;
    default:
      return null;
  }
}

function refLabel(ref: { type: string; id: string; label?: string }): string {
  if (ref.label) return ref.label;
  return `${ref.type} ${ref.id}`;
}

export function IssueRow({ issue, compact }: { issue: AnalysisIssue; compact?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-1.5 text-sm">
      {issue.severity === "error" ? (
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      ) : (
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
      )}
      <div className="min-w-0">
        <span>{issue.message}</span>
        {issue.refs.length > 0 && (
          <span className="ml-2 inline-flex gap-1.5">
            {issue.refs.map((ref) => {
              const href = refHref(ref);
              const label = refLabel(ref);
              return href ? (
                <Link key={`${ref.type}-${ref.id}`} href={href} className="text-primary underline underline-offset-2">
                  {label}
                </Link>
              ) : (
                <span key={`${ref.type}-${ref.id}`} className="text-muted-foreground">
                  {label}
                </span>
              );
            })}
          </span>
        )}
        {!compact && issue.suggestion && (
          <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lightbulb className="mt-0.5 size-3 shrink-0" />
            <span>{issue.suggestion}</span>
          </div>
        )}
      </div>
    </div>
  );
}
