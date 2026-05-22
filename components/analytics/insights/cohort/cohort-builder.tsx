"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { CohortBuilderBody } from "@/components/analytics/insights/cohort/cohort-builder-body";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCohort } from "@/lib/analytics/insights/cohort-context";

type Props = {
  /** When embedded inside a Sheet/Dialog, skip the outer Card chrome and the collapse toggle. */
  embedded?: boolean;
};

export function CohortBuilder({ embedded = false }: Props = {}) {
  const { reset } = useCohort();
  const [collapsed, setCollapsed] = useState(false);

  if (embedded) {
    return (
      <div className="space-y-5 pt-2">
        <CohortBuilderBody />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-sm font-semibold tracking-tight hover:underline"
            onClick={() => setCollapsed((c) => !c)}
          >
            Cohort
          </button>
          <span className="text-xs text-muted-foreground">
            {collapsed ? "click to expand" : "filters apply to both Facts and Plan insights"}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </CardHeader>
      {!collapsed && (
        <CardContent className="space-y-5">
          <CohortBuilderBody />
        </CardContent>
      )}
    </Card>
  );
}
