import Link from "next/link";
import { EntityIssueIndicator } from "@/components/analysis/entity-issue-indicator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ConstantsLookup, FactsLookup } from "@/lib/blob/resolve";
import { resolveConstantId } from "@/lib/blob/resolve";
import type { AnyCondition, BlobCondition, BlobRule } from "@/lib/blob/types";
import { cn, formatFactName } from "@/lib/utils";

type RuleCardProps = {
  rule: BlobRule & { index: number };
  facts: FactsLookup;
  constants: ConstantsLookup;
};

function isAnyCondition(c: BlobCondition): c is AnyCondition {
  return "any" in c;
}

function formatScalar(v: string | boolean | number): string {
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

function ConditionEntry({
  factKey,
  value,
  facts,
  constants
}: {
  factKey: string;
  value: string | boolean | number | number[] | string[];
  facts: FactsLookup;
  constants: ConstantsLookup;
}) {
  if (Array.isArray(value)) {
    return (
      <div>
        <span className="rounded bg-primary/10 px-1 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
          {formatFactName(factKey)}
        </span>{" "}
        contains:
        <div className="mt-1 flex flex-wrap gap-1">
          {value.map((item) => (
            <Badge key={String(item)} variant="secondary" className="font-normal">
              {resolveConstantId(item, factKey, facts, constants)}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <span className="rounded bg-primary/10 px-1 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
        {formatFactName(factKey)}
      </span>{" "}
      is <span className="font-medium">{formatScalar(value)}</span>
    </div>
  );
}

function ConditionText({
  condition,
  facts,
  constants
}: {
  condition: BlobCondition;
  facts: FactsLookup;
  constants: ConstantsLookup;
}) {
  if (isAnyCondition(condition)) {
    return (
      <div className="space-y-1">
        <span className="font-medium">When any of this is true:</span>
        <ul className="list-disc space-y-1 pl-5">
          {condition.any.map((sub, i) =>
            Object.entries(sub).map(([key, val]) => (
              <li key={`${i}-${key}`}>
                <ConditionEntry factKey={key} value={val} facts={facts} constants={constants} />
              </li>
            ))
          )}
        </ul>
      </div>
    );
  }

  const entries = Object.entries(condition);
  if (entries.length === 0) return null;

  return (
    <div className="space-y-1">
      <span className="font-medium">{entries.length === 1 ? "When:" : "When all of:"}</span>
      <div className="space-y-1 pl-2">
        {entries.map(([key, val]) => (
          <ConditionEntry key={key} factKey={key} value={val} facts={facts} constants={constants} />
        ))}
      </div>
    </div>
  );
}

export function RuleCard({ rule, facts, constants }: RuleCardProps) {
  return (
    <Link href={`/data/facts/${rule.sets}`} className="group block">
      <Card className={cn("gap-0 py-0 transition-colors hover:border-primary/50", !rule.enabled && "opacity-50")}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 py-3">
          <span className="flex items-center gap-1.5 text-sm">
            Rule for{" "}
            <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wide">
              {formatFactName(rule.sets)}
            </Badge>
          </span>
          <div className="flex items-center gap-1.5">
            <EntityIssueIndicator type="rule" id={String(rule.index)} />
            <Badge variant={rule.source === "hotspot" ? "default" : "secondary"} className="text-xs">
              {rule.source}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 border-t px-4 py-3 text-sm">
          <div>
            Sets to{" "}
            <Badge variant="outline" className="font-mono">
              {String(rule.value)}
            </Badge>
          </div>

          {rule.when && <ConditionText condition={rule.when} facts={facts} constants={constants} />}

          <p className="text-end text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Click to edit
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
