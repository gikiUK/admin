"use client";

import type { ComponentProps } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type Props = {
  body: string;
  className?: string;
};

export function MarkdownPreview({ body, className }: Props) {
  return (
    <div className={cn("text-sm leading-relaxed text-foreground", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {body}
      </ReactMarkdown>
    </div>
  );
}

const markdownComponents: Components = {
  h1: ({ className, ...props }) => (
    <h1 className={cn("mt-6 mb-3 text-2xl font-semibold tracking-tight first:mt-0", className)} {...props} />
  ),
  h2: ({ className, ...props }) => (
    <h2 className={cn("mt-6 mb-2 text-xl font-semibold tracking-tight first:mt-0", className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("mt-5 mb-2 text-lg font-semibold tracking-tight first:mt-0", className)} {...props} />
  ),
  h4: ({ className, ...props }) => (
    <h4 className={cn("mt-4 mb-2 text-base font-semibold first:mt-0", className)} {...props} />
  ),
  p: ({ className, ...props }) => <p className={cn("mb-3 last:mb-0 leading-relaxed", className)} {...props} />,
  a: ({ className, ...props }) => (
    <a
      className={cn("font-medium text-primary underline underline-offset-4 hover:no-underline", className)}
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("mb-3 ml-6 list-disc space-y-1 last:mb-0", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("mb-3 ml-6 list-decimal space-y-1 last:mb-0", className)} {...props} />
  ),
  li: ({ className, ...props }) => <li className={cn("leading-relaxed", className)} {...props} />,
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("mb-3 border-l-2 border-border pl-4 italic text-muted-foreground last:mb-0", className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => <hr className={cn("my-6 border-border", className)} {...props} />,
  code: ({ className, ...props }: ComponentProps<"code"> & { inline?: boolean }) => {
    const { inline, ...rest } = props;
    if (inline) {
      return (
        <code
          className={cn("rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-[0.85em] text-foreground", className)}
          {...rest}
        />
      );
    }
    return <code className={cn("font-mono text-[0.85em]", className)} {...rest} />;
  },
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "mb-3 overflow-x-auto rounded-md border bg-muted p-4 font-mono text-[0.85em] leading-relaxed last:mb-0",
        className
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="mb-3 w-full overflow-x-auto last:mb-0">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }) => <thead className={cn("border-b bg-muted/50", className)} {...props} />,
  tr: ({ className, ...props }) => <tr className={cn("border-b last:border-b-0", className)} {...props} />,
  th: ({ className, ...props }) => <th className={cn("px-3 py-2 text-left font-semibold", className)} {...props} />,
  td: ({ className, ...props }) => <td className={cn("px-3 py-2", className)} {...props} />,
  img: ({ className, alt, ...props }) => (
    // biome-ignore lint/performance/noImgElement: markdown image URLs are arbitrary, next/image isn't a fit
    <img className={cn("my-3 max-w-full rounded-md border", className)} alt={alt ?? ""} {...props} />
  ),
  strong: ({ className, ...props }) => <strong className={cn("font-semibold", className)} {...props} />,
  em: ({ className, ...props }) => <em className={cn("italic", className)} {...props} />
};
