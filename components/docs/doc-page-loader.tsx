import { readFile } from "node:fs/promises"
import path from "node:path"
import { MarkdownDoc } from "./markdown-doc"

interface DocPageLoaderProps {
  slug: string
}

export async function DocPageLoader({ slug }: DocPageLoaderProps) {
  const content = await readFile(
    path.join(process.cwd(), `app/(dashboard)/(facts-engine)/docs/content/${slug}.md`),
    "utf-8"
  )
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <MarkdownDoc content={content} />
    </div>
  )
}
