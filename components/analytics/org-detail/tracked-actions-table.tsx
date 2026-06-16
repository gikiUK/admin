import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrgTrackedAction } from "@/lib/analytics/api";
import { TrackedActionRow } from "./tracked-action-row";

export function TrackedActionsTable({ actions, emptyLabel }: { actions: OrgTrackedAction[]; emptyLabel: string }) {
  return (
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
              {emptyLabel}
            </TableCell>
          </TableRow>
        ) : (
          actions.map((action) => <TrackedActionRow key={action.id} action={action} />)
        )}
      </TableBody>
    </Table>
  );
}
