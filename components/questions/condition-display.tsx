import { Badge } from "@/components/ui/badge";
import type { AnyCondition, Condition, SimpleCondition } from "@/lib/data/types";

function isAnyCondition(condition: Condition): condition is AnyCondition {
  return "any" in condition;
}

function renderSimple(condition: SimpleCondition) {
  return Object.entries(condition).map(([fact, value]) => (
    <Badge key={fact} variant="outline" className="font-mono text-xs">
      {fact} = {String(value)}
    </Badge>
  ));
}

export function ConditionDisplay({ condition }: { condition?: Condition }) {
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
