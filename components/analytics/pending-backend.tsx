import { Construction } from "lucide-react";

type PendingBackendProps = {
  endpoint: string;
};

export function PendingBackend({ endpoint }: PendingBackendProps) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
      <Construction className="mt-0.5 size-4 shrink-0" />
      <div>
        <div className="font-medium text-foreground">Backend endpoint pending</div>
        <div>
          This panel will populate once <code className="font-mono text-xs">{endpoint}</code> ships on the API. Tracked
          in <code className="font-mono text-xs">docs/plan-analytics-api-gaps.md</code>.
        </div>
      </div>
    </div>
  );
}
