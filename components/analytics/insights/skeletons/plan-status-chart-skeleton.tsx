import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_ROW_COUNT = 5;
const ROW_HEIGHT = 28;
const CHART_PADDING = 32;

export function PlanStatusChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-1.5 h-3 w-32" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2" style={{ height: STATUS_ROW_COUNT * ROW_HEIGHT + CHART_PADDING }}>
          {Array.from({ length: STATUS_ROW_COUNT }, (_, i) => `row-${i}`).map((id) => (
            <div key={id} className="flex items-center gap-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
