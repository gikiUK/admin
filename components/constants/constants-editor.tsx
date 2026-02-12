"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import type { ConstantGroup, ConstantValue } from "@/lib/data/types";
import { ConstantGroupCard } from "./constant-group-card";
import { GroupModal } from "./group-modal";

type ConstantsEditorProps = {
  initialGroups: ConstantGroup[];
  actions: {
    addGroup: (name: string, valueType: "string" | "label-value") => Promise<ConstantGroup>;
    deleteGroup: (name: string) => Promise<void>;
    addValue: (groupName: string, value: ConstantValue) => Promise<void>;
    updateValue: (groupName: string, index: number, value: ConstantValue) => Promise<void>;
    deleteValue: (groupName: string, index: number) => Promise<void>;
  };
};

export function ConstantsEditor({ initialGroups, actions }: ConstantsEditorProps) {
  const [groups, setGroups] = useState<ConstantGroup[]>(initialGroups);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  async function handleAddGroup(name: string, valueType: "string" | "label-value") {
    const group = await actions.addGroup(name, valueType);
    setGroups((prev) => [...prev, group]);
  }

  async function handleDeleteGroup(name: string) {
    await actions.deleteGroup(name);
    setGroups((prev) => prev.filter((g) => g.name !== name));
  }

  async function handleAddValue(groupName: string, value: ConstantValue) {
    await actions.addValue(groupName, value);
    setGroups((prev) => prev.map((g) => (g.name === groupName ? { ...g, values: [...g.values, value] } : g)));
  }

  async function handleUpdateValue(groupName: string, index: number, value: ConstantValue) {
    await actions.updateValue(groupName, index, value);
    setGroups((prev) =>
      prev.map((g) => {
        if (g.name !== groupName) return g;
        const values = [...g.values];
        values[index] = value;
        return { ...g, values };
      })
    );
  }

  async function handleDeleteValue(groupName: string, index: number) {
    await actions.deleteValue(groupName, index);
    setGroups((prev) =>
      prev.map((g) => {
        if (g.name !== groupName) return g;
        const values = g.values.filter((_, i) => i !== index);
        return { ...g, values };
      })
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Constants"
        description="Shared enums referenced across facts, questions, and actions."
        action={
          <Button onClick={() => setGroupModalOpen(true)}>
            <Plus className="size-4" />
            Add Group
          </Button>
        }
      />

      <div className="space-y-4">
        {groups.map((group) => (
          <ConstantGroupCard
            key={group.name}
            group={group}
            onDeleteGroup={() => handleDeleteGroup(group.name)}
            onAddValue={(val) => handleAddValue(group.name, val)}
            onUpdateValue={(idx, val) => handleUpdateValue(group.name, idx, val)}
            onDeleteValue={(idx) => handleDeleteValue(group.name, idx)}
          />
        ))}
      </div>

      <GroupModal open={groupModalOpen} onOpenChange={setGroupModalOpen} onSave={handleAddGroup} />
    </div>
  );
}
