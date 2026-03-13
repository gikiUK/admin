import type { IRunOptions } from "docx";
import { ExternalHyperlink, Paragraph, TextRun } from "docx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { COLORS } from "./styles";

type MdNode = {
  type: string;
  children?: MdNode[];
  value?: string;
  url?: string;
  ordered?: boolean;
};

const parser = unified().use(remarkParse);

export function markdownToParagraphs(content: string): Paragraph[] {
  if (!content || !content.trim()) return [];

  const tree = parser.parse(content) as MdNode;
  const result: Paragraph[] = [];

  for (const node of tree.children ?? []) {
    result.push(...nodeToElements(node));
  }
  return result;
}

function nodeToElements(node: MdNode): Paragraph[] {
  switch (node.type) {
    case "paragraph":
      return [new Paragraph({ children: inlineChildren(node), spacing: { after: 140 } })];

    case "list":
      return (node.children ?? []).flatMap((item) => listItemToElements(item));

    case "heading":
      return [new Paragraph({ children: inlineChildren(node) })];

    default:
      // Fallback: extract text content
      if (node.value) return [new Paragraph({ children: [new TextRun(node.value)] })];
      return [];
  }
}

function listItemToElements(item: MdNode): Paragraph[] {
  // A listItem contains paragraph(s). We render the first paragraph as a bullet,
  // and any subsequent content as indented paragraphs.
  const paragraphs: Paragraph[] = [];
  for (const child of item.children ?? []) {
    if (child.type === "paragraph") {
      paragraphs.push(
        new Paragraph({
          children: inlineChildren(child),
          bullet: { level: 0 },
          spacing: { after: 80 }
        })
      );
    } else {
      paragraphs.push(...nodeToElements(child));
    }
  }
  return paragraphs;
}

function inlineChildren(node: MdNode): (TextRun | ExternalHyperlink)[] {
  return (node.children ?? []).flatMap((child) => inlineNode(child, {}));
}

function inlineNode(node: MdNode, inherited: Partial<IRunOptions>): (TextRun | ExternalHyperlink)[] {
  switch (node.type) {
    case "text":
      return [new TextRun({ text: node.value ?? "", ...inherited })];

    case "strong":
      return (node.children ?? []).flatMap((child) =>
        inlineNode(child, { ...inherited, bold: true, color: COLORS.HEADING })
      );

    case "emphasis":
      return (node.children ?? []).flatMap((child) => inlineNode(child, { ...inherited, italics: true }));

    case "link":
      return [
        new ExternalHyperlink({
          link: node.url ?? "",
          children: (node.children ?? []).flatMap((child) =>
            inlineNode(child, { ...inherited, color: COLORS.PRIMARY_BLUE, underline: { type: "single" } })
          )
        })
      ];

    case "inlineCode":
      return [new TextRun({ text: node.value ?? "", font: "Courier New", ...inherited })];

    default:
      if (node.value) return [new TextRun({ text: node.value, ...inherited })];
      return (node.children ?? []).flatMap((child) => inlineNode(child, inherited));
  }
}
