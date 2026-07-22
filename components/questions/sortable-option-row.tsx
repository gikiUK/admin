"use client";

import { type AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DebouncedInput } from "@/components/ui/debounced-input";
import type { BlobOption } from "@/lib/blob/types";
import { cn } from "@/lib/utils";

type SortableOptionRowProps = {
  id: string;
  option: BlobOption;
  onUpdate: (updates: Partial<BlobOption>) => void;
  onRemove: () => void;
};

// Animate rows shifting out of the way during a drag, but NOT the layout change on drop. With
// stable ids the dropped element is already in its final slot, so a drop animation would make it
// flicker back to its start and re-animate forward.
const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  args.isSorting ? defaultAnimateLayoutChanges(args) : false;

export function SortableOptionRow({ id, option, onUpdate, onRemove }: SortableOptionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "grid grid-cols-[20px_1fr_220px_70px_32px] items-center gap-2 bg-background",
        isDragging && "relative z-10 opacity-80 shadow-sm"
      )}
    >
      <button
        type="button"
        className="flex h-8 cursor-grab touch-none items-center justify-center text-muted-foreground/60 hover:text-muted-foreground focus-visible:outline-none active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>
      <DebouncedInput
        value={option.label}
        onCommit={(v) => onUpdate({ label: v })}
        placeholder="Label"
        className="h-8 text-xs md:text-xs"
      />
      <DebouncedInput
        value={option.value}
        onCommit={(v) => onUpdate({ value: v })}
        placeholder="value"
        className="h-8 font-mono text-xs md:text-xs"
      />
      <div className="flex justify-center">
        <Checkbox
          checked={option.exclusive ?? false}
          onCheckedChange={(checked) => onUpdate({ exclusive: checked === true ? true : undefined })}
        />
      </div>
      <Button variant="ghost" size="icon-xs" onClick={onRemove}>
        <X className="size-3" />
      </Button>
    </div>
  );
}
