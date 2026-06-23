import { ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { actionPath, actionUrl, type ManagedAction } from "@/lib/manage/actions-api";
import { CopyActionUrlButton } from "./copy-action-url-button";

type ActionsTableProps = {
  actions: ManagedAction[];
};

export function ActionsTable({ actions }: ActionsTableProps) {
  return (
    <div className="rounded-md border">
      <TooltipProvider>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-[160px]">Airtable Record ID</TableHead>
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
                  <TableCell className="font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate">{action.title}</span>
                      </TooltipTrigger>
                      <TooltipContent>{action.title}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground truncate">{actionPath(action)}</span>
                      <a
                        href={actionUrl(action)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
                        aria-label={`Open ${action.title}`}
                      >
                        Open
                        <ExternalLink className="size-3.5" />
                      </a>
                      <CopyActionUrlButton url={actionUrl(action)} title={action.title} />
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground truncate">
                    {action.airtable_id ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  );
}
