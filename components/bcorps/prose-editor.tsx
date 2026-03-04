"use client";

import { cn } from "@/lib/utils";

type ProseEditorProps = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
};

export function ProseEditor({ value, onChange, placeholder, className, rows = 4 }: ProseEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
    />
  );
}
