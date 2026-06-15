"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import { cn } from "@/lib/utils";

type Props = {
  body: string;
  className?: string;
};

const ALLOWED_ELEMENTS = ["p", "strong", "em", "ul", "li"];

export function MarkdownPreview({ body, className }: Props) {
  return (
    <div className={cn("text-sm leading-relaxed text-foreground", className)}>
      <ReactMarkdown allowedElements={ALLOWED_ELEMENTS} unwrapDisallowed components={markdownComponents}>
        {body}
      </ReactMarkdown>
    </div>
  );
}

const markdownComponents: Components = {
  p: ({ className, ...props }) => <p className={cn("mb-3 last:mb-0 leading-relaxed", className)} {...props} />,
  ul: ({ className, ...props }) => (
    <ul className={cn("mb-3 ml-6 list-disc space-y-1 last:mb-0", className)} {...props} />
  ),
  li: ({ className, ...props }) => <li className={cn("leading-relaxed", className)} {...props} />,
  strong: ({ className, ...props }) => <strong className={cn("font-semibold", className)} {...props} />,
  em: ({ className, ...props }) => <em className={cn("italic", className)} {...props} />
};
