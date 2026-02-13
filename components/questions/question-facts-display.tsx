import { Badge } from "@/components/ui/badge";
import type { Question } from "@/lib/data/types";

export function QuestionFactsDisplay({ question }: { question: Question }) {
  if (question.fact) {
    return (
      <Badge variant="secondary" className="font-mono text-xs">
        {question.fact}
      </Badge>
    );
  }

  if (question.facts) {
    const factKeys = Object.keys(question.facts.defaults ?? {});
    if (factKeys.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {factKeys.map((key) => (
          <Badge key={key} variant="secondary" className="font-mono text-xs">
            {key}
          </Badge>
        ))}
      </div>
    );
  }

  return null;
}
