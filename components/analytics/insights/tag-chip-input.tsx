"use client";

import { X } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Props = {
  legend: string;
  placeholder?: string;
  value: string[];
  onChange: (next: string[]) => void;
};

export function TagChipInput({ legend, placeholder = "type tag, press enter", value, onChange }: Props) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((v) => v !== tag));
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{legend}</span>
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pl-2 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded hover:bg-muted-foreground/20"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => draft && addTag(draft)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="h-6 flex-1 min-w-[120px] border-0 bg-transparent px-1 py-0 text-sm shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
