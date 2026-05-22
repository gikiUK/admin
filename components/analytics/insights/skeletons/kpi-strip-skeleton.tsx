import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
