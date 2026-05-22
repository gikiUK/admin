"use client";

import { useState } from "react";
import { EngagementAxisToggle } from "@/components/analytics/actions/engagement/engagement-axis-toggle";
import { EngagementChart } from "@/components/analytics/actions/engagement/engagement-chart";
import { buildEngagementPoints } from "@/components/analytics/actions/engagement/engagement-points";
import type { EngagementAxis } from "@/components/analytics/actions/engagement/engagement-types";
import { SectionCard } from "@/components/analytics/actions/shared/section-card";
import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";

type Props = {
  rows: ActionLeaderboardRow[];
  minTracked?: number;
};

export function EngagementScatter({ rows, minTracked = 5 }: Props) {
  const [axis, setAxis] = useState<EngagementAxis>("assignee_coverage");
  const points = buildEngagementPoints(rows, axis, minTracked);

  const description = (
    <>
      Each dot is an action with ≥{minTracked} tracked instances. Dot area scales with adoption count. Hunt for outliers
      — actions far above or below the diagonal are worth a closer look.
    </>
  );

  return (
    <SectionCard
      title="Engagement quality"
      description={description}
      headerAction={<EngagementAxisToggle value={axis} onChange={setAxis} />}
      empty={points.length === 0 ? `No actions with ≥${minTracked} tracked instances in this range.` : undefined}
    >
      <EngagementChart axis={axis} points={points} />
    </SectionCard>
  );
}
