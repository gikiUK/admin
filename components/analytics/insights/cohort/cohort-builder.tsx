"use client";

import { Check, RotateCcw, Undo2 } from "lucide-react";
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
  const { reset, apply, discard, hasUnsavedChanges } = useCohort();
  const [collapsed, setCollapsed] = useState(false);

  const footer = hasUnsavedChanges ? (
    <div className="sticky bottom-0 mt-4 flex items-center justify-end gap-2 border-t bg-card/95 py-3 backdrop-blur">
      <span className="mr-auto text-xs text-muted-foreground">Unsaved changes</span>
      <Button variant="ghost" size="sm" onClick={discard}>
        <Undo2 className="size-3.5" />
        Discard
      </Button>
      <Button size="sm" onClick={() => apply()}>
        <Check className="size-3.5" />
        Apply
      </Button>
    </div>
  ) : null;

  if (embedded) {
    return (
      <div className="space-y-5 pt-2">
        <CohortBuilderBody />
        {footer}
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
          {footer}
        </CardContent>
      )}
    </Card>
  );
}
