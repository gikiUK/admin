"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Workshop } from "@/lib/workshops/api";

type Props = {
  workshops: Workshop[];
  onRemove: (uuid: string) => void;
};

export function WorkshopBadges({ workshops, onRemove }: Props) {
  return (
    <>
      {workshops.map((w) => (
        <Badge key={w.uuid} variant="secondary" className="gap-1 pl-2 pr-1">
          {w.title}
          <button
            type="button"
            onClick={() => onRemove(w.uuid)}
            className="rounded hover:bg-muted-foreground/20"
            aria-label={`Remove ${w.title}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </>
  );
}
