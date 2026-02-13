import { Eye, EyeOff, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Question } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { ConditionDisplay } from "./condition-display";
import { QuestionFactsDisplay } from "./question-facts-display";
import { QuestionOptionsDisplay } from "./question-options-display";
import { QuestionTypeBadge } from "./question-type-badge";

type QuestionCardProps = {
  question: Question;
  conditionallyHidden: boolean;
};

export function QuestionCard({ question, conditionallyHidden }: QuestionCardProps) {
  const q = question;

  return (
    <Link href={`/data/questions/${q.index}`} className="block">
      <Card
        className={cn("transition-colors hover:border-primary/40", conditionallyHidden && "border-dashed opacity-80")}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium leading-snug">
              <span className="mr-2 text-muted-foreground">Q{q.index + 1}</span>
              {q.label}
            </CardTitle>
            <QuestionTypeBadge type={q.type} />
          </div>
          {q.description && <p className="text-xs text-muted-foreground">{q.description}</p>}
        </CardHeader>

        <CardContent className="space-y-3">
          <QuestionFactsDisplay question={q} />
          <QuestionOptionsDisplay question={q} />

          {(q.showWhen || q.hideWhen || q.unknowable) && (
            <div className="space-y-1.5 border-t pt-3">
              {q.showWhen && (
                <div className="flex items-start gap-1.5 text-xs">
                  <Eye className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-muted-foreground">Shown when</span>
                    <ConditionDisplay condition={q.showWhen} />
                  </div>
                </div>
              )}
              {q.hideWhen && (
                <div className="flex items-start gap-1.5 text-xs">
                  <EyeOff className="mt-0.5 size-3.5 shrink-0 text-orange-500" />
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-muted-foreground">Hidden when</span>
                    <ConditionDisplay condition={q.hideWhen} />
                  </div>
                </div>
              )}
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
    </Link>
  );
}
