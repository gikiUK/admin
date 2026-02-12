"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConstantGroup, ConstantValue } from "@/lib/data/types";
import { ValueModal } from "./value-modal";
import { ValuePill } from "./value-pill";

type ConstantGroupCardProps = {
  group: ConstantGroup;
  onDeleteGroup: () => void;
  onAddValue: (value: ConstantValue) => void;
  onUpdateValue: (index: number, value: ConstantValue) => void;
  onDeleteValue: (index: number) => void;
};

function formatGroupName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bOptions\b/i, "Options");
}

function isLabelValueGroup(group: ConstantGroup): boolean {
  return group.values.length > 0 && typeof group.values[0] === "object";
}

export function ConstantGroupCard({
  group,
  onDeleteGroup,
  onAddValue,
  onUpdateValue,
  onDeleteValue
}: ConstantGroupCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const isLabelValue = isLabelValueGroup(group);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{formatGroupName(group.name)}</CardTitle>
          <CardAction>
            {confirmDelete ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-destructive">Delete group?</span>
                <Button variant="destructive" size="xs" onClick={onDeleteGroup}>
                  Yes
                </Button>
                <Button variant="outline" size="xs" onClick={() => setConfirmDelete(false)}>
                  No
                </Button>
              </span>
            ) : (
              <Button variant="ghost" size="icon-sm" onClick={() => setConfirmDelete(true)} aria-label="Delete group">
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            )}
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {group.values.map((value, index) => (
              <ValuePill
                key={typeof value === "string" ? value : value.value}
                value={value}
                onEdit={() => {
                  setEditIndex(index);
                  setModalOpen(true);
                }}
                onDelete={() => onDeleteValue(index)}
              />
            ))}
            {group.values.length === 0 && (
              <p className="text-sm text-muted-foreground">No values yet. Add one below.</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditIndex(null);
              setModalOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add Value
          </Button>
        </CardFooter>
      </Card>

      <ValueModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        isLabelValue={isLabelValue}
        initialValue={editIndex !== null ? group.values[editIndex] : undefined}
        onSave={(val) => {
          if (editIndex !== null) {
            onUpdateValue(editIndex, val);
          } else {
            onAddValue(val);
          }
        }}
      />
    </>
  );
}
