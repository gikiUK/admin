import { FactBreakdownChartSkeleton } from "@/components/analytics/insights/skeletons/fact-breakdown-chart-skeleton";

type Props = {
  count: number;
};

export function FactsBreakdownGridSkeleton({ count }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: count }, (_, i) => `fact-${i}`).map((id) => (
        <FactBreakdownChartSkeleton key={id} />
      ))}
    </div>
  );
}
