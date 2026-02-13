import { ArrowRight, GitBranch, MessageSquare, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { ConditionDisplay } from "@/components/questions/condition-display";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FactRelationships } from "@/lib/data/types";

type FactSourcesCardProps = {
  relationships: FactRelationships;
};

export function FactSourcesCard({ relationships }: FactSourcesCardProps) {
  const { setByQuestion, derivedFrom, constrainedBy, actionCount } = relationships;
  const hasAny = setByQuestion || derivedFrom || constrainedBy.length > 0 || actionCount > 0;

  if (!hasAny) return null;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold">Sources</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {setByQuestion && <QuestionSource source={setByQuestion} />}
        {derivedFrom && <DerivedSource rule={derivedFrom} />}
        {constrainedBy.length > 0 && <ConstraintSources rules={constrainedBy} />}
        {actionCount > 0 && <ActionCount count={actionCount} />}
      </CardContent>
    </Card>
  );
}

function QuestionSource({ source }: { source: NonNullable<FactRelationships["setByQuestion"]> }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <MessageSquare className="size-3.5" />
        User input
      </div>
      <div className="ml-5.5 space-y-2">
        <Link
          href={`/data/questions/${source.index}`}
          className="group flex items-start gap-2 text-sm hover:text-primary"
        >
          <Badge variant="outline" className="shrink-0">
            Q{source.index + 1}
          </Badge>
          <span className="leading-snug">&ldquo;{source.label}&rdquo;</span>
          <ArrowRight className="mt-0.5 size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>

        {source.mappings && source.mappings.length > 0 && (
          <div className="space-y-1 rounded border bg-muted/30 px-3 py-2">
            <div className="text-xs text-muted-foreground">
              Default: <ValueBadge value={source.defaultValue} />
            </div>
            {source.mappings.map((m) => (
              <div key={m.option} className="flex items-center gap-1.5 text-xs">
                <span className="font-mono text-muted-foreground">{m.option}</span>
                <ArrowRight className="size-3 text-muted-foreground" />
                <ValueBadge value={m.value} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DerivedSource({ rule }: { rule: NonNullable<FactRelationships["derivedFrom"]> }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <GitBranch className="size-3.5 text-green-500" />
        Derived
      </div>
      <div className="ml-5.5 flex flex-wrap items-center gap-1 text-sm">
        <span>
          Set to <ValueBadge value={rule.value} /> when
        </span>
        <ConditionDisplay condition={rule.when} />
      </div>
    </div>
  );
}

function ConstraintSources({ rules }: { rules: FactRelationships["constrainedBy"] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <ShieldAlert className="size-3.5 text-amber-500" />
        Constraints ({rules.length})
      </div>
      <div className="ml-5.5 space-y-2">
        {rules.map((rule) => (
          <div key={`${rule.sets}-${rule.value}`} className="flex flex-wrap items-center gap-1 text-sm">
            <span>
              Set to <ValueBadge value={rule.value} /> when
            </span>
            <ConditionDisplay condition={rule.when} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionCount({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <Zap className="size-3.5 text-purple-500" />
      Referenced by {count} action{count !== 1 ? "s" : ""}
    </div>
  );
}

function ValueBadge({ value }: { value: string | boolean | undefined }) {
  if (value === undefined) return null;
  const label = String(value);
  const variant = value === true ? "default" : value === false ? "secondary" : "outline";
  return (
    <Badge variant={variant} className="text-xs">
      {label}
    </Badge>
  );
}
