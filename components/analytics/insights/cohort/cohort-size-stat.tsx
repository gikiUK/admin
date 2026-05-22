"use client";

import { Users } from "lucide-react";

type Props = {
  cohortSize: number | undefined;
  totalOrgs: number | undefined;
};

export function CohortSizeStat({ cohortSize, totalOrgs }: Props) {
  const showShare = totalOrgs !== undefined && cohortSize !== undefined;
  const sharePct = showShare ? (cohortSize / Math.max(totalOrgs, 1)) * 100 : 0;

  return (
    <div className="flex items-center gap-2 pr-2 border-r">
      <Users className="size-4 text-muted-foreground" />
      <div className="leading-tight">
        <div className="text-sm font-semibold tabular-nums">
          {cohortSize === undefined ? "—" : cohortSize.toLocaleString()}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {showShare ? `${sharePct.toFixed(1)}% of all orgs` : "orgs in cohort"}
        </div>
      </div>
    </div>
  );
}
