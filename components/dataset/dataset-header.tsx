"use client";

import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataset } from "@/lib/blob/use-dataset";
import { ChangesPanel } from "./changes-panel";

export function DatasetHeader() {
  const { isDirty, saving, save, changeLog } = useDataset();
  const [panelOpen, setPanelOpen] = useState(false);

  if (!isDirty && !saving) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        {changeLog.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setPanelOpen(true)}>
            {changeLog.length} {changeLog.length === 1 ? "change" : "changes"}
          </Button>
        )}
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <ChangesPanel open={panelOpen} onOpenChange={setPanelOpen} />
    </>
  );
}
