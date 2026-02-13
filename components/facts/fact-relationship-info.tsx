import { ArrowUpRight, GitBranch, ShieldAlert, Zap } from "lucide-react";
import { ConditionDisplay } from "@/components/questions/condition-display";
import type { FactRelationships } from "@/lib/blob/types";

type FactRelationshipInfoProps = {
  relationships: FactRelationships;
};

export function FactRelationshipInfo({ relationships }: FactRelationshipInfoProps) {
  const { setByQuestion, derivedFrom, constrainedBy, actionCount } = relationships;
  const hasAny = setByQuestion || derivedFrom || constrainedBy.length > 0 || actionCount > 0;

  if (!hasAny) return null;

  return (
    <div className="space-y-2 text-sm">
      {setByQuestion && (
        <div className="flex items-start gap-2">
          <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-blue-500" />
          <span>
            Set by Q{setByQuestion.index + 1}:{" "}
            <span className="text-muted-foreground">&ldquo;{setByQuestion.label}&rdquo;</span>
          </span>
        </div>
      )}

      {derivedFrom && (
        <div className="flex items-start gap-2">
          <GitBranch className="mt-0.5 size-4 shrink-0 text-green-500" />
          <div className="flex flex-wrap items-center gap-1">
            <span>Derived when</span>
            <ConditionDisplay condition={derivedFrom.when} />
          </div>
        </div>
      )}

      {constrainedBy.map((rule, i) => (
        <div key={`constraint-${rule.sets}-${i}`} className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <div className="flex flex-wrap items-center gap-1">
            <span>Set to {String(rule.value)} when</span>
            <ConditionDisplay condition={rule.when} />
          </div>
        </div>
      ))}

      {actionCount > 0 && (
        <div className="flex items-start gap-2">
          <Zap className="mt-0.5 size-4 shrink-0 text-purple-500" />
          <span>
            Referenced by {actionCount} action{actionCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
