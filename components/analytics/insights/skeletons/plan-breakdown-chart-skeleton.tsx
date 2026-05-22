import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors PIE_SIZE in plan-breakdown-chart.tsx. Update both together.
const PIE_SIZE = 160;

export function PlanBreakdownChartSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Skeleton className="shrink-0 rounded-full" style={{ width: PIE_SIZE, height: PIE_SIZE }} />
          <ul className="flex-1 space-y-2" style={{ maxHeight: PIE_SIZE }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="flex items-center gap-2">
                <Skeleton className="size-2.5 shrink-0 rounded-sm" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-10" />
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
