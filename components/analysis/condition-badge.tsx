"use client";

import { Eye, EyeOff, Filter, FilterX } from "lucide-react";
import { useMemo } from "react";
import { ConditionDisplay } from "@/components/questions/condition-display";
import type { BlobCondition } from "@/lib/blob/types";

const VARIANTS = {
  show_when: { icon: Eye, label: "Show when", color: "text-blue-500" },
  hide_when: { icon: EyeOff, label: "Hide when", color: "text-orange-500" },
  include_when: { icon: Filter, label: "Include when", color: "text-blue-500" },
  exclude_when: { icon: FilterX, label: "Exclude when", color: "text-orange-500" }
} as const;

export type ConditionType = keyof typeof VARIANTS;

type Props = {
  type: ConditionType;
  condition: BlobCondition;
  /** Fact IDs to highlight as sourceless */
  sourcelessFacts?: string[];
};

export function ConditionBadge({ type, condition, sourcelessFacts }: Props) {
  const v = VARIANTS[type];
  const Icon = v.icon;
  const highlightSet = useMemo(
    () => (sourcelessFacts?.length ? new Set(sourcelessFacts) : undefined),
    [sourcelessFacts]
  );

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Icon className={`size-3.5 shrink-0 ${v.color}`} />
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-muted-foreground">{v.label}</span>
        <ConditionDisplay condition={condition} highlightFacts={highlightSet} />
      </div>
    </div>
  );
}
