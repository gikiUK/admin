"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { CohortBuilder } from "@/components/analytics/insights/cohort/cohort-builder";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function CohortEditSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
