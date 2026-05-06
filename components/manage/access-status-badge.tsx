import { Badge } from "@/components/ui/badge";
import type { OrgAccessStatus } from "@/lib/manage/api";
import { cn } from "@/lib/utils";

const STYLES: Record<OrgAccessStatus, string> = {
  premium: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  premium_trial: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  standard: "border-muted-foreground/30 bg-muted text-muted-foreground"
};

const LABELS: Record<OrgAccessStatus, string> = {
  premium: "Premium",
  premium_trial: "Trial",
  standard: "Standard"
};

export function AccessStatusBadge({ status }: { status: OrgAccessStatus }) {
  return (
    <Badge variant="outline" className={cn("text-xs", STYLES[status])}>
      {LABELS[status]}
    </Badge>
  );
}
