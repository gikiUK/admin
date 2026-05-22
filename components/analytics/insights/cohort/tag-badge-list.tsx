"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  tags: string[];
  onRemove: (tag: string) => void;
};

export function TagBadgeList({ tags, onRemove }: Props) {
  return (
    <>
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pl-2 pr-1">
          {tag}
          <button
            type="button"
            onClick={() => onRemove(tag)}
            className="rounded hover:bg-muted-foreground/20"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </>
  );
}
