"use client";

import { Input } from "@/components/ui/input";

export function TagInput({ onAdd }: { onAdd: (tag: string) => void }) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value) {
        onAdd(value);
        e.currentTarget.value = "";
      }
    }
  }

  return <Input placeholder="Type value and press Enter..." className="h-7 text-xs" onKeyDown={handleKeyDown} />;
}
