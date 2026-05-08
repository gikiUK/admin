import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrgTrackedAction } from "@/lib/analytics/api";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "./format";

const TRACKED_STATUS_STYLES: Record<string, string> = {
  not_started: "border-muted-foreground/30 bg-muted text-muted-foreground",
  in_progress: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  archived: "border-muted-foreground/30 bg-muted text-muted-foreground",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
};

export function TrackedActionsSection({ actions }: { actions: OrgTrackedAction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tracked actions ({actions.length})</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[140px]">Assignee</TableHead>
              <TableHead className="w-[120px]">Due</TableHead>
              <TableHead className="w-[160px]">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No tracked actions.
                </TableCell>
              </TableRow>
            ) : (
              actions.map((action) => (
                <TableRow key={action.id}>
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
                  <TableCell className="text-xs text-muted-foreground">{formatDate(action.due_date)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(action.updated_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
