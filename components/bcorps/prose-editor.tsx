"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type ProseEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
};

/**
 * Minimal prose editor stored as HTML.
 * Enter → new <p>, Shift+Enter → <br>
 */
export function ProseEditor({ value, onChange, placeholder, className, rows = 4 }: ProseEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== value) el.innerHTML = value || "";
  }, [value]);

  function handleInput() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (isComposing.current || e.key !== "Enter") return;
    e.preventDefault();
    if (e.shiftKey) {
      document.execCommand("insertHTML", false, "<br>");
    } else {
      document.execCommand("insertParagraph", false);
    }
  }

  const editorClass = cn(
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "prose-editor empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60",
    "[&_p]:mb-2 [&_p:last-child]:mb-0",
    className
  );

  const style = { minHeight: `${rows * 1.6}rem` };

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: contentEditable div is intentional */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => {
          isComposing.current = true;
        }}
        onCompositionEnd={() => {
          isComposing.current = false;
          handleInput();
        }}
        data-placeholder={placeholder}
        style={style}
        className={editorClass}
      />
    </>
  );
}
