"use client";

import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataset } from "@/lib/blob/use-dataset";
import { ChangesPanel } from "./changes-panel";
import { DiffView } from "./diff-view";

export function DatasetHeader() {
  const { isDirty, saving, changeLog } = useDataset();
  const [panelOpen, setPanelOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const wasDirty = useRef(isDirty);

  useEffect(() => {
    if (wasDirty.current && !isDirty) {
      setPanelOpen(false);
      setReviewOpen(false);
    }
    wasDirty.current = isDirty;
  }, [isDirty]);

  if (!isDirty && !saving) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        {changeLog.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setPanelOpen(true)}>
            {changeLog.length} {changeLog.length === 1 ? "change" : "changes"}
          </Button>
        )}
        <Button size="sm" onClick={() => setReviewOpen(true)} disabled={saving}>
          <Eye className="size-3" />
          Review
        </Button>
      </div>

      <ChangesPanel open={panelOpen} onOpenChange={setPanelOpen} />
      <DiffView open={reviewOpen} onOpenChange={setReviewOpen} />
    </>
  );
}
