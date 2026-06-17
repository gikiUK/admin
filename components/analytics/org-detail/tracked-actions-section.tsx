"use client";

import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { OrgTrackedAction } from "@/lib/analytics/api";
import { TrackedActionsTable } from "./tracked-actions-table";

export function TrackedActionsSection({ actions }: { actions: OrgTrackedAction[] }) {
  const active = actions.filter((a) => a.status !== "rejected");
  const rejected = actions.filter((a) => a.status === "rejected");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tracked actions ({active.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <TrackedActionsTable actions={active} emptyLabel="No tracked actions." />
        </CardContent>
      </Card>

      <Card>
        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-6 py-4 text-left">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Rejected</CardTitle>
              <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {rejected.length}
              </Badge>
            </div>
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="px-4 pt-0">
              <TrackedActionsTable actions={rejected} emptyLabel="No rejected actions." variant="rejected" />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
