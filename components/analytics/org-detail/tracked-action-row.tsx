import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { OrgTrackedAction } from "@/lib/analytics/api";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "./format";
import { RejectionReasonCell } from "./rejection-reason-cell";

const TRACKED_STATUS_STYLES: Record<string, string> = {
  not_started: "border-muted-foreground/30 bg-muted text-muted-foreground",
  in_progress: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  archived: "border-muted-foreground/30 bg-muted text-muted-foreground",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
};

export function TrackedActionRow({
  action,
  variant = "active"
}: {
  action: OrgTrackedAction;
  variant?: "active" | "rejected";
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{action.title}</div>
        <div className="text-xs text-muted-foreground">
          {action.action_type === "Company::CustomAction" ? "Custom" : "System"}
          {action.pre_giki_status && <span className="ml-1">· pre-giki: {action.pre_giki_status}</span>}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            "text-xs capitalize",
            TRACKED_STATUS_STYLES[action.status] ?? TRACKED_STATUS_STYLES.not_started
          )}
        >
          {action.status.replace("_", " ")}
        </Badge>
      </TableCell>
      <TableCell className="text-xs">
        {action.assignee_name || <span className="text-muted-foreground">—</span>}
      </TableCell>
      {variant === "rejected" ? (
        <TableCell>
          <RejectionReasonCell rejection={action.rejection_details} />
        </TableCell>
      ) : (
        <TableCell className="text-xs text-muted-foreground">{formatDate(action.due_date)}</TableCell>
      )}
      <TableCell className="text-xs text-muted-foreground">{formatDateTime(action.updated_at)}</TableCell>
    </TableRow>
  );
}
