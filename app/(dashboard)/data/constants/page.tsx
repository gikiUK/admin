"use client";

import { Eye, EyeOff, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { BlobConstantValue } from "@/lib/blob/types";
import { useDataset } from "@/lib/blob/use-dataset";
import { cn } from "@/lib/utils";

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

            <div className="flex items-center justify-between">
              <Label>Status</Label>
              <button
                type="button"
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                  draft.enabled
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                onClick={() => setDraft({ ...draft, enabled: !draft.enabled })}
              >
                {draft.enabled ? "Enabled" : "Disabled"}
              </button>
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

function ValuePill({
  value,
  onEdit,
  onToggle
}: {
  value: BlobConstantValue;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const display = value.label ?? value.name;
  const ToggleIcon = value.enabled ? EyeOff : Eye;

  return (
    <span
      className={cn(
        "group inline-flex items-center rounded-full border text-sm transition-colors",
        value.enabled ? "bg-secondary" : "border-dashed bg-muted/50 text-muted-foreground opacity-60"
      )}
    >
      <button
        type="button"
        className="cursor-pointer rounded-l-full py-1 pl-3 pr-2 hover:bg-accent"
        onClick={onEdit}
        title={value.label ? `${value.label} → ${value.name}` : undefined}
      >
        <span className="mr-1 text-muted-foreground">{value.id}.</span>
        {display}
      </button>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                "cursor-pointer rounded-r-full py-1 pr-2 pl-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
                value.enabled ? "hover:text-foreground" : "hover:text-primary"
              )}
              onClick={onToggle}
            >
              <ToggleIcon className="size-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{value.enabled ? "Disable" : "Enable"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}

// ── Filter types ────────────────────────────────────────

type StatusFilter = "all" | "enabled" | "disabled";

// ── Group card ──────────────────────────────────────────

function ConstantGroupCard({
  groupKey,
  values,
  onEditValue,
  onToggleValue,
  onAddValue
}: {
  groupKey: string;
  values: BlobConstantValue[];
  onEditValue: (group: string, value: BlobConstantValue) => void;
  onToggleValue: (group: string, valueId: number, enabled: boolean) => void;
  onAddValue: (group: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const enabledCount = values.filter((v) => v.enabled).length;

  const filtered = useMemo(() => {
    let result = values;
    if (filter === "enabled") result = result.filter((v) => v.enabled);
    if (filter === "disabled") result = result.filter((v) => !v.enabled);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((v) => v.name.toLowerCase().includes(q) || v.label?.toLowerCase().includes(q));
    }
    return result;
  }, [values, search, filter]);

  const hasFilters = search || filter !== "all";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-mono text-sm font-semibold">{groupKey}</h3>
          <Button variant="outline" size="sm" onClick={() => onAddValue(groupKey)}>
            <Plus className="size-3" />
            Add value
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {enabledCount} of {values.length} values enabled
        </p>
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search values..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
          <div className="flex rounded-md border">
            {(["all", "enabled", "disabled"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "px-2.5 py-1 text-xs capitalize transition-colors first:rounded-l-md last:rounded-r-md",
                  filter === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {filtered.map((value) => (
            <ValuePill
              key={value.id}
              value={value}
              onEdit={() => onEditValue(groupKey, value)}
              onToggle={() => onToggleValue(groupKey, value.id, !value.enabled)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">{hasFilters ? "No matching values." : "No values yet."}</p>
          )}
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

  function handleToggleValue(group: string, valueId: number, enabled: boolean) {
    dispatch({ type: "TOGGLE_CONSTANT_VALUE", group, valueId, enabled });
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
            onToggleValue={handleToggleValue}
            onAddValue={handleAddValue}
          />
        ))}
      </div>

      {editState && <EditConstantDialog editState={editState} onClose={() => setEditState(null)} onSave={handleSave} />}
    </div>
  );
}
