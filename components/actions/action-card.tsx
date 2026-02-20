"use client";

import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ConstantsLookup, FactsLookup } from "@/lib/blob/resolve";
import { resolveConstantId } from "@/lib/blob/resolve";
import type { Action, AnyCondition, BlobActionCondition, BlobCondition, SimpleCondition } from "@/lib/blob/types";
import { cn, formatFactName } from "@/lib/utils";

type ActionCardProps = {
  action: Action;
  condition?: BlobActionCondition;
  facts: FactsLookup;
  constants: ConstantsLookup;
};

type LookupProps = { facts: FactsLookup; constants: ConstantsLookup };

function isAnyCondition(c: BlobCondition): c is AnyCondition {
  return "any" in c;
}

function isEmptyCondition(c: BlobCondition): boolean {
  if (isAnyCondition(c)) return c.any.length === 0;
  return Object.keys(c).length === 0;
}

function ResolvedValue({
  factKey,
  value,
  facts,
  constants
}: { factKey: string; value: string | boolean | number | number[] | string[] } & LookupProps) {
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item) => (
          <Badge key={String(item)} variant="secondary" className="text-xs font-normal">
            {resolveConstantId(item, factKey, facts, constants)}
          </Badge>
        ))}
      </div>
    );
  }
  if (typeof value === "boolean") {
    return <span className="text-xs font-medium">{value ? "true" : "false"}</span>;
  }
  return <span className="text-xs font-medium">{resolveConstantId(value, factKey, facts, constants)}</span>;
}

function ConditionEntries({ entries, facts, constants }: { entries: SimpleCondition } & LookupProps) {
  return (
    <div className="space-y-1.5">
      {Object.entries(entries).map(([key, val]) => (
        <div key={key} className="flex items-baseline gap-1.5">
          <Badge variant="outline" className="shrink-0 text-xs font-semibold uppercase tracking-wide">
            {formatFactName(key)}
          </Badge>
          <span className="text-xs text-muted-foreground">=</span>
          <ResolvedValue factKey={key} value={val} facts={facts} constants={constants} />
        </div>
      ))}
    </div>
  );
}

function ConditionBlock({
  label,
  condition,
  facts,
  constants
}: { label: string; condition: BlobCondition } & LookupProps) {
  if (isEmptyCondition(condition)) return null;

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {isAnyCondition(condition) ? (
        <div className="space-y-2 pl-2">
          {condition.any.map((sub, i) => (
            <div key={`any-${i}-${Object.keys(sub).join("-")}`} className="space-y-1">
              {i > 0 && <span className="text-xs italic text-muted-foreground">or</span>}
              <ConditionEntries entries={sub} facts={facts} constants={constants} />
            </div>
          ))}
        </div>
      ) : (
        <div className="pl-2">
          <ConditionEntries entries={condition} facts={facts} constants={constants} />
        </div>
      )}
    </div>
  );
}

function ConditionDetail({ condition, facts, constants }: { condition: BlobActionCondition } & LookupProps) {
  const hasDismiss = condition.dismiss_options && condition.dismiss_options.length > 0;

  return (
    <div className="space-y-3 border-t px-4 py-3">
      <ConditionBlock label="Include when" condition={condition.include_when} facts={facts} constants={constants} />
      <ConditionBlock label="Exclude when" condition={condition.exclude_when} facts={facts} constants={constants} />
      {hasDismiss && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dismiss options</span>
          <div className="space-y-1 pl-2">
            {condition.dismiss_options?.map((opt) => (
              <div key={opt.label} className="flex items-baseline gap-1.5">
                <Badge variant="secondary" className="text-xs">
                  {opt.label}
                </Badge>
                {opt.sets && (
                  <span className="text-xs text-muted-foreground">
                    sets{" "}
                    {Object.entries(opt.sets)
                      .map(([k, v]) => `${formatFactName(k)} = ${v}`)
                      .join(", ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function conditionKeyCount(condition: BlobActionCondition): number {
  const inc = isAnyCondition(condition.include_when)
    ? condition.include_when.any.length
    : Object.keys(condition.include_when).length;
  const exc = isAnyCondition(condition.exclude_when)
    ? condition.exclude_when.any.length
    : Object.keys(condition.exclude_when).length;
  return inc + exc;
}

export function ActionCard({ action, condition, facts, constants }: ActionCardProps) {
  const hasCondition = !!condition;
  const conditionEnabled = condition?.enabled ?? false;
  const count = condition ? conditionKeyCount(condition) : 0;
  const dismissCount = condition?.dismiss_options?.length ?? 0;

  return (
    <Card className={cn("gap-0 py-0 transition-colors", !action.enabled && "opacity-50")}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 py-3">
        <span className="text-sm font-medium">{action.title}</span>
        <div className="flex items-center gap-1.5">
          {!action.enabled && (
            <Badge variant="outline" className="text-xs">
              disabled
            </Badge>
          )}
          <Badge variant="secondary" className="font-mono text-xs">
            #{action.id}
          </Badge>
        </div>
      </CardHeader>

      {hasCondition ? (
        <Collapsible>
          <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-3 border-t px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50">
            <ChevronRight className="size-3.5 shrink-0 transition-transform [[data-state=open]>&]:rotate-90" />
            <Badge variant={conditionEnabled ? "default" : "outline"} className="text-xs">
              {conditionEnabled ? "active" : "inactive"}
            </Badge>
            <span>
              {count} condition{count !== 1 ? "s" : ""}
            </span>
            {dismissCount > 0 && (
              <span>
                {dismissCount} dismiss option{dismissCount !== 1 ? "s" : ""}
              </span>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ConditionDetail condition={condition} facts={facts} constants={constants} />
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <CardContent className="border-t px-4 py-3 text-sm italic text-muted-foreground">
          No conditions configured
        </CardContent>
      )}
    </Card>
  );
}
