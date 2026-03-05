"use client"

import ReactMarkdown from "react-markdown"
import remarkDirective from "remark-directive"

interface MarkdownDocProps {
  content: string
}

export function MarkdownDoc({ content }: MarkdownDocProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkDirective]}
      components={{
        h1: ({ children }) => <h1 className="mb-2 text-3xl font-bold tracking-tight">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-4 mt-8 text-xl font-semibold tracking-tight">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 mt-4 font-semibold">{children}</h3>,
        p: ({ children }) => <p className="text-[15px] leading-relaxed">{children}</p>,
        a: ({ href, children }) => (
          <a href={href} className="text-primary underline">
            {children}
          </a>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.startsWith("language-")
          if (isBlock) {
            return (
              <code className="block overflow-x-auto whitespace-pre rounded-lg bg-muted p-4 text-sm leading-relaxed">
                {children}
              </code>
            )
          }
          return <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{children}</code>
        },
        pre: ({ children }) => <pre className="my-2">{children}</pre>,
        ul: ({ children }) => <ul className="list-inside list-disc space-y-1 text-[15px]">{children}</ul>,
        ol: ({ children }) => <ol className="list-inside list-decimal space-y-2 text-[15px]">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        dl: ({ children }) => <dl className="space-y-2">{children}</dl>,
        dt: ({ children }) => (
          <dt className="inline font-medium">
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{children}</code>
          </dt>
        ),
        dd: ({ children }) => <dd className="ml-2 inline text-muted-foreground">{children}</dd>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
