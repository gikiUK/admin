"use client";

import { AlertCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEntityIssues } from "@/lib/analysis/analysis-context";

type EntityIssueIndicatorProps = {
  type: string;
  id: string;
};

export function EntityIssueIndicator({ type, id }: EntityIssueIndicatorProps) {
  const issues = useEntityIssues(type, id);
  const router = useRouter();

  if (issues.length === 0) return null;

  const hasError = issues.some((i) => i.severity === "error");
  const Icon = hasError ? AlertCircle : AlertTriangle;
  const colorClass = hasError ? "text-red-500" : "text-amber-500";

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    router.push("/data/analysis");
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            className={`inline-flex cursor-pointer items-center gap-0.5 ${colorClass}`}
          >
            <Icon className="size-4" />
            {issues.length > 1 && <span className="text-xs font-medium">{issues.length}</span>}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-72">
          <div className="space-y-1">
            {issues.slice(0, 2).map((issue) => (
              <p key={issue.message}>{issue.message}</p>
            ))}
            {issues.length > 2 && <p className="text-muted-foreground">+{issues.length - 2} more</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
