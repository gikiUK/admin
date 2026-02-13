"use client";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { computeDatasetDiff, type DiffEntry, type DiffKind } from "@/lib/blob/dataset-diff";
import { useDataset } from "@/lib/blob/use-dataset";

const kindColors: Record<DiffKind, string> = {
  added: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  modified: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  discarded: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  restored: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
};

const entityLabels: Record<DiffEntry["entity"], string> = {
  fact: "Facts",
  question: "Questions",
  rule: "Rules"
};

function DiffEntryRow({ entry }: { entry: DiffEntry }) {
  return (
    <div className="rounded-md border p-2">
      <div className="flex items-center gap-2">
        <Badge className={kindColors[entry.kind]}>{entry.kind}</Badge>
        <span className="text-sm font-medium">{entry.label}</span>
      </div>
      {entry.fields.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 pl-1">
          {entry.fields.map((f) => (
            <li key={f.field} className="text-muted-foreground text-xs">
              <span className="font-medium">{f.field}</span>:{" "}
              <span className="text-red-600 line-through dark:text-red-400">{f.from}</span>
              {" → "}
              <span className="text-green-600 dark:text-green-400">{f.to}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DiffView({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { blob, original } = useDataset();

  const diff = original && blob ? computeDatasetDiff(original, blob) : null;

  if (!diff) return null;

  const grouped = {
    fact: diff.entries.filter((e) => e.entity === "fact"),
    question: diff.entries.filter((e) => e.entity === "question"),
    rule: diff.entries.filter((e) => e.entity === "rule")
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Diff ({diff.totalChanges} changes)</DialogTitle>
        </DialogHeader>

        {diff.totalChanges === 0 ? (
          <p className="text-muted-foreground text-sm">No differences found.</p>
        ) : (
          <div className="space-y-4">
            {(["fact", "question", "rule"] as const).map((entity) => {
              const entries = grouped[entity];
              if (entries.length === 0) return null;
              return (
                <div key={entity}>
                  <h3 className="mb-2 text-sm font-semibold">{entityLabels[entity]}</h3>
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <DiffEntryRow key={entry.key} entry={entry} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
