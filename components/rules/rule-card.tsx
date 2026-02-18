import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AnyCondition, BlobCondition, BlobConstantValue, BlobFact, BlobRule } from "@/lib/blob/types";
import { cn } from "@/lib/utils";

type ConstantsLookup = Record<string, BlobConstantValue[]>;
type FactsLookup = Record<string, BlobFact>;

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

function resolveArrayItem(
  item: string | number,
  factKey: string,
  facts: FactsLookup,
  constants: ConstantsLookup
): string {
  if (typeof item === "string") return item;
  const fact = facts[factKey];
  const group = fact?.values_ref ? constants[fact.values_ref] : undefined;
  const entry = group?.find((c) => c.id === item);
  return entry?.label ?? entry?.name ?? String(item);
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
        <code className="rounded bg-primary/10 px-1 py-0.5 font-mono text-xs text-primary">{factKey}</code> contains:
        <div className="mt-1 flex flex-wrap gap-1">
          {value.map((item) => (
            <Badge key={String(item)} variant="secondary" className="font-normal">
              {resolveArrayItem(item, factKey, facts, constants)}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <code className="rounded bg-primary/10 px-1 py-0.5 font-mono text-xs text-primary">{factKey}</code> is{" "}
      <span className="font-medium">{formatScalar(value)}</span>
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
            <Badge variant="outline" className="font-medium">
              {rule.sets}
            </Badge>
          </span>
          <Badge variant={rule.source === "hotspot" ? "default" : "secondary"} className="text-xs">
            {rule.source}
          </Badge>
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
