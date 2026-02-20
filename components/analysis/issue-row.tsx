import { AlertCircle, AlertTriangle, Lightbulb } from "lucide-react";
import Link from "next/link";
import type { AnalysisIssue } from "@/lib/analysis/types";
import { ConditionBadge } from "./condition-badge";

function refHref(ref: { type: string; id: string }): string | null {
  switch (ref.type) {
    case "fact":
      return `/data/facts/${ref.id}`;
    case "question":
      return `/data/questions#q-${ref.id}`;
    case "rule":
      return `/data/rules#r-${ref.id}`;
    case "action":
      return `/data/actions#a-${ref.id}`;
    default:
      return null;
  }
}

function refLabel(ref: { type: string; id: string; label?: string }): string {
  if (ref.label) return ref.label;
  if (ref.type === "action") return `Action #${ref.id}`;
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
        {issue.refs.length > 0 && (
          <span className="mr-1.5 inline-flex gap-1.5">
            {issue.refs.map((ref) => {
              const href = refHref(ref);
              const label = refLabel(ref);
              return href ? (
                <Link
                  key={`${ref.type}-${ref.id}`}
                  href={href}
                  className="font-medium text-primary underline underline-offset-2"
                >
                  {label}
                </Link>
              ) : (
                <span key={`${ref.type}-${ref.id}`} className="font-medium text-muted-foreground">
                  {label}
                </span>
              );
            })}
          </span>
        )}
        <span>{issue.message}</span>
        {!compact && issue.conditions && issue.conditions.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {issue.conditions.map((c) => (
              <ConditionBadge key={c.tag} type={c.tag} condition={c.condition} sourcelessFacts={c.sourcelessFacts} />
            ))}
          </div>
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
