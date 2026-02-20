"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckCircle2, ChevronRight, Lightbulb } from "lucide-react";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { CheckResult } from "@/lib/analysis/types";
import { IssueRow } from "./issue-row";

const ROW_HEIGHT = 32;
const VIRTUALIZE_THRESHOLD = 100;

/** Collect unique suggestions from all issues in the result */
function collectSuggestions(result: CheckResult): string[] {
  const seen = new Set<string>();
  const suggestions: string[] = [];
  for (const issue of result.issues) {
    if (issue.suggestion && !seen.has(issue.suggestion)) {
      seen.add(issue.suggestion);
      suggestions.push(issue.suggestion);
    }
  }
  return suggestions;
}

function SuggestionBanner({ suggestions }: { suggestions: string[] }) {
  return (
    <div className="border-t bg-muted/30 px-4 py-2.5">
      {suggestions.map((s) => (
        <div key={s} className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Lightbulb className="mt-0.5 size-3 shrink-0" />
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}

function VirtualizedIssues({ result }: { result: CheckResult }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: result.issues.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20
  });

  const suggestions = collectSuggestions(result);

  return (
    <>
      {suggestions.length > 0 && <SuggestionBanner suggestions={suggestions} />}
      <div ref={parentRef} className="border-t overflow-auto" style={{ maxHeight: 400 }}>
        <div className="relative px-4" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((row) => (
            <div
              key={row.index}
              className="absolute left-0 top-0 w-full px-4"
              style={{ height: ROW_HEIGHT, transform: `translateY(${row.start}px)` }}
            >
              <IssueRow issue={result.issues[row.index]} compact />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function CheckResultCard({ result }: { result: CheckResult }) {
  const hasIssues = result.issues.length > 0;
  const errorCount = result.issues.filter((i) => i.severity === "error").length;
  const warningCount = result.issues.filter((i) => i.severity === "warning").length;
  const useVirtual = result.issues.length > VIRTUALIZE_THRESHOLD;

  return (
    <Collapsible defaultOpen={hasIssues}>
      <div className="rounded-lg border bg-card">
        <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50">
          <ChevronRight className="size-4 shrink-0 transition-transform [[data-state=open]>&]:rotate-90" />
          {hasIssues ? (
            <span className="size-2 shrink-0 rounded-full bg-destructive" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          )}
          <div className="flex-1">
            <span className="font-medium">{result.name}</span>
            <span className="ml-2 text-sm text-muted-foreground">{result.description}</span>
          </div>
          {errorCount > 0 && (
            <Badge variant="destructive">
              {errorCount} error{errorCount !== 1 ? "s" : ""}
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
              {warningCount} warning{warningCount !== 1 ? "s" : ""}
            </Badge>
          )}
          {!hasIssues && <span className="text-sm text-emerald-600 dark:text-emerald-400">Pass</span>}
        </CollapsibleTrigger>
        <CollapsibleContent>
          {hasIssues &&
            (useVirtual ? (
              <VirtualizedIssues result={result} />
            ) : (
              <div className="border-t px-4 py-2">
                {result.issues.map((issue) => (
                  <IssueRow key={issue.message} issue={issue} />
                ))}
              </div>
            ))}
          {!hasIssues && <div className="border-t px-4 py-3 text-sm text-muted-foreground">No issues found.</div>}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
