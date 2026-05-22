import { PlanBreakdownChartSkeleton } from "@/components/analytics/insights/skeletons/plan-breakdown-chart-skeleton";

type Props = {
  count: number;
};

export function PlanBreakdownGridSkeleton({ count }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: count }, (_, i) => `plan-${i}`).map((id) => (
        <PlanBreakdownChartSkeleton key={id} />
      ))}
    </div>
  );
}
