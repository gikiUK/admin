"use client";

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import { disambiguate } from "@/components/analytics/actions/leaderboard/leaderboard-helpers";
import { LeaderboardTooltip } from "@/components/analytics/actions/leaderboard/leaderboard-tooltip";
import { TruncatedYTick } from "@/components/analytics/actions/leaderboard/truncated-y-tick";
import { COMPLETION_COLOR_MAX_RATE, completionColor } from "@/components/analytics/actions/shared/completion-color";
import { SectionCard } from "@/components/analytics/actions/shared/section-card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";

type Props = {
  rows: ActionLeaderboardRow[];
  limit?: number;
};

const CHART_CONFIG = { adoption_count: { label: "Adoption", color: "var(--primary)" } } satisfies ChartConfig;
const BAR_HEIGHT = 22;
const Y_AXIS_WIDTH = 280;
const Y_TICK_TEXT_WIDTH = Y_AXIS_WIDTH - 12;

export function LeaderboardChart({ rows, limit = 20 }: Props) {
  const data = disambiguate(rows.slice(0, limit));
  const height = Math.max(data.length * BAR_HEIGHT + 32, 160);

  const description = <>Bar color: completion rate (red 0% → green {Math.round(COMPLETION_COLOR_MAX_RATE * 100)}%+).</>;

  return (
    <SectionCard
      title="Top actions by adoption"
      description={description}
      empty={data.length === 0 ? "No actions picked in this range." : undefined}
    >
      <ChartContainer config={CHART_CONFIG} className="w-full" style={{ height }}>
        <BarChart layout="vertical" data={data} margin={{ top: 0, right: 56, left: 0, bottom: 0 }}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={Y_AXIS_WIDTH}
            tick={<TruncatedYTick textWidth={Y_TICK_TEXT_WIDTH} />}
            interval={0}
          />
          <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<LeaderboardTooltip />} />
          <Bar dataKey="adoption_count" radius={[3, 3, 3, 3]}>
            {data.map((row) => (
              <Cell key={`${row.action_type}-${row.action_id}`} fill={completionColor(row.completion_rate)} />
            ))}
            <LabelList
              dataKey="adoption_count"
              position="right"
              offset={6}
              fontSize={11}
              fill="var(--muted-foreground)"
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </SectionCard>
  );
}
