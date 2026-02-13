import { Badge } from "@/components/ui/badge";
import type { QuestionType } from "@/lib/blob/types";

const typeConfig: Record<QuestionType, { label: string; className: string }> = {
  boolean_state: { label: "Yes / No", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  "single-select": {
    label: "Single Select",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
  },
  "multi-select": {
    label: "Multi Select",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  },
  "checkbox-radio-hybrid": {
    label: "Hybrid",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  }
};

export function QuestionTypeBadge({ type }: { type: QuestionType }) {
  const config = typeConfig[type];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
