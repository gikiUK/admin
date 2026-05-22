"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { CohortBuilder } from "@/components/analytics/insights/cohort/cohort-builder";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCohort } from "@/lib/analytics/insights/cohort-context";

export function CohortEditSheet() {
  const [open, setOpen] = useState(false);
  const { discard } = useCohort();

  function handleOpenChange(next: boolean) {
    // Drawer is the only scope for draft edits — wipe any uncommitted changes
    // on close so reopening starts clean.
    if (!next) discard();
    setOpen(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <Pencil className="size-3" />
          Edit cohort
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit cohort</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <CohortBuilder embedded />
        </div>
      </SheetContent>
    </Sheet>
  );
}
