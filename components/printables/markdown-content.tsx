import ReactMarkdown from "react-markdown";

export function MarkdownContent({ content }: { content: string }) {
  if (!content) return null;
  return <ReactMarkdown>{content}</ReactMarkdown>;
}
