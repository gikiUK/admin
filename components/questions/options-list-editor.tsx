"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { BlobOption } from "@/lib/blob/types";
import { SortableOptionRow } from "./sortable-option-row";

type OptionsListEditorProps = {
  options: BlobOption[];
  onChange: (options: BlobOption[]) => void;
};

export function OptionsListEditor({ options, onChange }: OptionsListEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Options have no stable ID. Assign one per option object so React (and dnd-kit) follow the
  // moved element across a reorder instead of re-animating a positional slot — which caused the
  // dropped row to snap back before animating into place.
  const idMap = useRef(new WeakMap<BlobOption, string>());
  const nextId = useRef(0);
  const ids = options.map((opt) => {
    let id = idMap.current.get(opt);
    if (!id) {
      id = `option-${nextId.current++}`;
      idMap.current.set(opt, id);
    }
    return id;
  });

  function handleAdd() {
    onChange([...options, { label: "", value: "" }]);
  }

  function handleUpdate(index: number, updates: Partial<BlobOption>) {
    const next = [...options];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  }

  function handleRemove(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onChange(arrayMove(options, from, to));
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">Options</Label>

      {options.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-[20px_1fr_220px_70px_32px] items-center gap-2 text-xs font-medium text-muted-foreground">
            <span />
            <span>Label</span>
            <span>Value</span>
            <span>Exclusive</span>
            <span />
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <SortableOptionRow
                    key={ids[i]}
                    id={ids[i]}
                    option={opt}
                    onUpdate={(updates) => handleUpdate(i, updates)}
                    onRemove={() => handleRemove(i)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={handleAdd}>
        <Plus className="size-3" /> Add option
      </Button>
    </div>
  );
}
