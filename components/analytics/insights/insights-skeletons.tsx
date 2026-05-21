import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Skeletons mirror the real components' DOM shape closely enough that swapping
// between skeleton and real content doesn't shift the layout. If you change a
// real chart's dimensions, update the matching skeleton too.

const PIE_SIZE = 160; // mirrors PlanBreakdownChart

export function KpiStripSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-9 w-32" />
          <Skeleton className="mt-2 h-3 w-48" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-3 md:col-span-2">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="py-3">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="mt-1.5 h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function PlanStatusChartSkeleton() {
  // Match `data.length * 28 + 32` for 5 status rows = 172px chart area.
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-1.5 h-3 w-32" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2" style={{ height: 5 * 28 + 32 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function FactBreakdownChartSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-3 h-3 w-2/3" />
      </CardContent>
    </Card>
  );
}

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

export function FactsBreakdownGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: count }, (_, i) => `fact-${i}`).map((id) => (
        <FactBreakdownChartSkeleton key={id} />
      ))}
    </div>
  );
}

export function PlanBreakdownGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: count }, (_, i) => `plan-${i}`).map((id) => (
        <PlanBreakdownChartSkeleton key={id} />
      ))}
    </div>
  );
}
