import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
  // Numeric ID — resolve via fact's values_ref → constants group
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
        <span className="font-mono text-muted-foreground">{factKey}</span> contains:
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
      <span className="font-mono text-muted-foreground">{factKey}</span> is{" "}
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
        <span className="text-muted-foreground">When any of:</span>
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
      <span className="text-muted-foreground">{entries.length === 1 ? "When:" : "When all of:"}</span>
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
      <div
        className={cn(
          "rounded-xl border bg-card px-4 py-3 text-sm shadow-sm transition-colors hover:border-primary/40",
          !rule.enabled && "opacity-50"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">
            Rule for <span className="font-mono">{rule.sets}</span>
          </span>
          <Badge variant={rule.source === "hotspot" ? "default" : "secondary"} className="text-xs">
            {rule.source}
          </Badge>
        </div>

        <div className="mt-1.5">
          Sets <span className="font-mono font-medium">{rule.sets}</span> to{" "}
          <span className="font-medium">{String(rule.value)}</span>
        </div>

        {rule.when && (
          <div className="mt-2">
            <ConditionText condition={rule.when} facts={facts} constants={constants} />
          </div>
        )}

        <p className="mt-2 text-end text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          Click to edit
        </p>
      </div>
    </Link>
  );
}
