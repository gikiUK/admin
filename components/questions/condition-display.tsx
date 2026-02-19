"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { resolveConstantId } from "@/lib/blob/resolve";
import type { AnyCondition, BlobCondition, SimpleCondition } from "@/lib/blob/types";
import { useDataset } from "@/lib/blob/use-dataset";
import { formatFactName } from "@/lib/utils";

function isAnyCondition(condition: BlobCondition): condition is AnyCondition {
  return "any" in condition;
}

export function ConditionDisplay({ condition }: { condition?: BlobCondition }) {
  const { blob } = useDataset();
  const facts = blob?.facts ?? {};
  const constants = blob?.constants ?? {};

  function renderSimple(cond: SimpleCondition) {
    return Object.entries(cond).map(([fact, value]) => {
      if (Array.isArray(value)) {
        const labels = value.map((item) => resolveConstantId(item, fact, facts, constants));
        return (
          <TooltipProvider key={fact}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help text-xs font-semibold uppercase tracking-wide">
                  {formatFactName(fact)} ({value.length} values)
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-xs">{labels.join(", ")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return (
        <Badge key={fact} variant="outline" className="text-xs font-semibold uppercase tracking-wide">
          {formatFactName(fact)} = {String(value)}
        </Badge>
      );
    });
  }

  if (!condition) return <span className="text-sm text-muted-foreground">-</span>;

  if (isAnyCondition(condition)) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-xs text-muted-foreground">any of:</span>
        {condition.any.map((c, i) => (
          <span key={`condition-${Object.keys(c).join("-")}-${i}`} className="flex items-center gap-1">
            {i > 0 && <span className="text-xs text-muted-foreground">|</span>}
            {renderSimple(c)}
          </span>
        ))}
      </div>
    );
  }

  return <div className="flex flex-wrap gap-1">{renderSimple(condition)}</div>;
}
