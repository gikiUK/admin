import type { EngagementAxis, EngagementPoint } from "@/components/analytics/actions/engagement/engagement-types";
import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";

export function buildEngagementPoints(
  rows: ActionLeaderboardRow[],
  axis: EngagementAxis,
  minTracked: number
): EngagementPoint[] {
  return rows
    .filter((r) => r.tracked_total >= minTracked)
    .map((r) => ({
      x: r[axis] * 100,
      y: r.completion_rate * 100,
      size: r.adoption_count,
      title: r.title ?? `#${r.action_id}`,
      adoption_count: r.adoption_count,
      completion_count: r.completion_count,
      coverage: r[axis],
      completion_rate: r.completion_rate,
      action_id: r.action_id,
      action_type: r.action_type
    }));
}
