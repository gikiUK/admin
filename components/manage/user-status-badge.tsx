import { Badge } from "@/components/ui/badge";
import type { UserStatus } from "@/lib/analytics/api";
import { cn } from "@/lib/utils";

const STYLES: Record<UserStatus, string> = {
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  dormant: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  churned: "border-muted-foreground/30 bg-muted text-muted-foreground",
  unconfirmed: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  bounced: "border-destructive/40 bg-destructive/10 text-destructive"
};

const LABELS: Record<UserStatus, string> = {
  active: "Active",
  dormant: "Dormant",
  churned: "Churned",
  unconfirmed: "Unconfirmed",
  bounced: "Bounced"
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge variant="outline" className={cn("text-xs", STYLES[status])}>
      {LABELS[status]}
    </Badge>
  );
}
