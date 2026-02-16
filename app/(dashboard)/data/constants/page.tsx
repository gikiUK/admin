"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlobConstantValue } from "@/lib/blob/types";
import { useDataset } from "@/lib/blob/use-dataset";

// ── Edit dialog ─────────────────────────────────────────

type EditState = {
  group: string;
  value: BlobConstantValue;
  isNew: boolean;
};

function EditConstantDialog({
  editState,
  onClose,
  onSave
}: {
  editState: EditState;
  onClose: () => void;
  onSave: (state: EditState) => void;
}) {
  const [draft, setDraft] = useState<BlobConstantValue>(editState.value);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ ...editState, value: draft });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editState.isNew ? "Add value" : "Edit value"} — {editState.group}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cv-name">Name</Label>
              <Input id="cv-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv-label">Label</Label>
              <Input
                id="cv-label"
                value={draft.label ?? ""}
                onChange={(e) => setDraft({ ...draft, label: e.target.value || undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv-desc">Description</Label>
              <Input
                id="cv-desc"
                value={draft.description ?? ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value || null })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="cv-enabled"
                checked={draft.enabled}
                onCheckedChange={(checked) => setDraft({ ...draft, enabled: checked === true })}
              />
              <Label htmlFor="cv-enabled">Enabled</Label>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{editState.isNew ? "Add" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Value pill ──────────────────────────────────────────

function ValuePill({ value, onClick }: { value: BlobConstantValue; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer">
      <Badge variant={value.enabled ? "secondary" : "outline"} className={!value.enabled ? "opacity-50" : undefined}>
        <span className="mr-1 text-muted-foreground">{value.id}.</span>
        {value.label ?? value.name}
      </Badge>
    </button>
  );
}

// ── Group card ──────────────────────────────────────────

function ConstantGroupCard({
  groupKey,
  values,
  onEditValue,
  onAddValue
}: {
  groupKey: string;
  values: BlobConstantValue[];
  onEditValue: (group: string, value: BlobConstantValue) => void;
  onAddValue: (group: string) => void;
}) {
  const enabledCount = values.filter((v) => v.enabled).length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <div>
          <h3 className="font-mono text-sm font-semibold">{groupKey}</h3>
          <p className="text-xs text-muted-foreground">
            {enabledCount} of {values.length} values enabled
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => onAddValue(groupKey)}>
          <Plus className="size-3" />
          Add value
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <ValuePill key={value.id} value={value} onClick={() => onEditValue(groupKey, value)} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ────────────────────────────────────────────────

export default function ConstantsPage() {
  const { blob, loading, dispatch } = useDataset();
  const [editState, setEditState] = useState<EditState | null>(null);

  if (loading || !blob) {
    return <div className="p-6 text-muted-foreground">Loading constants...</div>;
  }

  const groups = Object.entries(blob.constants);

  function handleEditValue(group: string, value: BlobConstantValue) {
    setEditState({ group, value: { ...value }, isNew: false });
  }

  function handleAddValue(group: string) {
    const existing = blob?.constants[group] ?? [];
    const maxId = existing.reduce((max, v) => Math.max(max, v.id), 0);
    setEditState({
      group,
      value: { id: maxId + 1, name: "", label: undefined, description: null, enabled: true },
      isNew: true
    });
  }

  function handleSave(state: EditState) {
    if (state.isNew) {
      dispatch({ type: "ADD_CONSTANT_VALUE", group: state.group, value: state.value });
    } else {
      dispatch({ type: "SET_CONSTANT_VALUE", group: state.group, valueId: state.value.id, value: state.value });
    }
    setEditState(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Constants" description="Shared enums referenced across facts, questions, and actions." />

      <div className="space-y-4">
        {groups.map(([key, values]) => (
          <ConstantGroupCard
            key={key}
            groupKey={key}
            values={values}
            onEditValue={handleEditValue}
            onAddValue={handleAddValue}
          />
        ))}
      </div>

      {editState && <EditConstantDialog editState={editState} onClose={() => setEditState(null)} onSave={handleSave} />}
    </div>
  );
}
