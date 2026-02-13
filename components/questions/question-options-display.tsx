import { Badge } from "@/components/ui/badge";
import type { BlobQuestion } from "@/lib/blob/types";

export function QuestionOptionsDisplay({ question }: { question: BlobQuestion }) {
  if (question.options_ref) {
    return (
      <Badge variant="outline" className="font-mono text-xs">
        {question.options_ref}
      </Badge>
    );
  }

  if (question.options && question.options.length > 0) {
    return (
      <div className="flex flex-wrap gap-1">
        {question.options.map((opt) => (
          <Badge key={opt.value} variant="outline" className="text-xs">
            {opt.label}
            {opt.exclusive && <span className="ml-1 text-muted-foreground">(excl.)</span>}
          </Badge>
        ))}
      </div>
    );
  }

  return null;
}
