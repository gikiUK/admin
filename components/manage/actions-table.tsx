import { ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { actionUrl, type ManagedAction } from "@/lib/manage/actions-api";

type ActionsTableProps = {
  actions: ManagedAction[];
};

export function ActionsTable({ actions }: ActionsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="w-[200px]">Airtable Record ID</TableHead>
            <TableHead className="w-[80px]">URL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No actions found.
              </TableCell>
            </TableRow>
          ) : (
            actions.map((action) => (
              <TableRow key={action.id}>
                <TableCell className="font-medium">{action.title}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{action.airtable_id ?? "—"}</TableCell>
                <TableCell>
                  <a
                    href={actionUrl(action)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    aria-label={`Open ${action.title}`}
                  >
                    Open
                    <ExternalLink className="size-3.5" />
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
