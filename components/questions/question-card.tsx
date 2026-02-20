"use client";

import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConditionBadge } from "@/components/analysis/condition-badge";
import { EntityIssueIndicator } from "@/components/analysis/entity-issue-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlobQuestion } from "@/lib/blob/types";
import { cn } from "@/lib/utils";
import { QuestionBehaviorSummary } from "./question-behavior-summary";
import { QuestionTypeBadge } from "./question-type-badge";

type QuestionCardProps = {
  question: BlobQuestion & { index: number };
  conditionallyHidden: boolean;
};

export function QuestionCard({ question, conditionallyHidden }: QuestionCardProps) {
  const q = question;
  const router = useRouter();
  const href = `/data/questions/${q.index}`;

  function handleClick(e: React.MouseEvent) {
    // Don't navigate if user clicked an inner link
    if ((e.target as HTMLElement).closest("a")) return;
    router.push(href);
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: card is supplemental click target, inner links are keyboard-accessible
    // biome-ignore lint/a11y/noStaticElementInteractions: intentional — card wraps interactive children
    <div onClick={handleClick} className="cursor-pointer">
      <Card
        className={cn(
          "transition-colors hover:border-primary/40",
          conditionallyHidden && "border-dashed opacity-80",
          !q.enabled && "opacity-50"
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium leading-snug">
              <span className="mr-2 text-muted-foreground">Q{q.index + 1}</span>
              {q.label}
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <EntityIssueIndicator type="question" id={String(q.index)} />
              <QuestionTypeBadge type={q.type} />
            </div>
          </div>
          {q.description && <p className="text-xs text-muted-foreground">{q.description}</p>}
        </CardHeader>

        <CardContent className="space-y-3">
          <QuestionBehaviorSummary question={q} />

          {(q.show_when || q.hide_when || q.unknowable) && (
            <div className="space-y-1.5 border-t pt-3">
              {q.show_when && <ConditionBadge type="show_when" condition={q.show_when} />}
              {q.hide_when && <ConditionBadge type="hide_when" condition={q.hide_when} />}
              {q.unknowable && (
                <div className="flex items-center gap-1.5 text-xs">
                  <HelpCircle className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Unknowable</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
