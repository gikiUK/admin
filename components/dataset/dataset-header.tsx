"use client";

import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataset } from "@/lib/blob/use-dataset";
import { ReviewDialog } from "./review-dialog";

export function DatasetHeader() {
  const { isDirty, saving, changeLog } = useDataset();
  const [open, setOpen] = useState(false);
  const wasDirty = useRef(isDirty);

  useEffect(() => {
    if (wasDirty.current && !isDirty) {
      setOpen(false);
    }
    wasDirty.current = isDirty;
  }, [isDirty]);

  if (!isDirty && !saving) return null;

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} disabled={saving}>
        <Eye className="size-3" />
        {changeLog.length} {changeLog.length === 1 ? "change" : "changes"} · Review
      </Button>

      <ReviewDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
