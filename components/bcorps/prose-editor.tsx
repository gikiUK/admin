"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";

type ProseEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
};

export function ProseEditor({ value, onChange, placeholder, className, rows = 4 }: ProseEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Only paragraphs and hard breaks — no headings, lists, etc.
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
        bold: false,
        italic: false
      })
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    }
  });

  const minHeight = `${rows * 1.6}rem`;

  return (
    <EditorContent
      editor={editor}
      style={{ minHeight }}
      data-placeholder={placeholder}
      className={cn(
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        "prose-editor [&_.tiptap]:outline-none [&_.tiptap]:min-h-[inherit]",
        "[&_.tiptap_p]:mb-2 [&_.tiptap_p:last-child]:mb-0",
        className
      )}
    />
  );
}
