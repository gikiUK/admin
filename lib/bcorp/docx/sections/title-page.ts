import { AlignmentType, Paragraph, ShadingType, TextRun } from "docx";
import type { BcorpData } from "@/lib/bcorp/types";
import { COLORS, FONT } from "../styles";

const PT = (pt: number) => pt * 2;

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDate(date: Date): string {
  const day = ordinal(date.getDate());
  const month = date.toLocaleDateString("en-GB", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function buildTitlePage(data: BcorpData): Paragraph[] {
  return [
    // Brand name
    new Paragraph({
      spacing: { after: 600 },
      children: [
        new TextRun({ text: "Giki ", font: FONT, size: PT(18), bold: true, color: COLORS.WHITE }),
        new TextRun({ text: "Actions", font: FONT, size: PT(18), bold: true, color: COLORS.LIGHT_BLUE })
      ]
    }),

    // Accent bar (approximated with a coloured line)
    new Paragraph({
      spacing: { after: 320 },
      shading: { type: ShadingType.SOLID, color: "3B82F6" },
      children: [new TextRun({ text: " ", size: PT(3) })]
    }),

    // Title
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({ text: "B Corp Climate Action Plan", font: FONT, size: PT(36), bold: true, color: COLORS.WHITE })
      ]
    }),

    // Subtitle
    new Paragraph({
      spacing: { after: 480 },
      children: [new TextRun({ text: `${data.name} | 2025`, font: FONT, size: PT(16), color: COLORS.LIGHT_BLUE })]
    }),

    // Metadata
    metaLine("Prepared by:", "Jo Hand"),
    metaLine("Date:", formatDate(new Date())),
    metaLine("Version:", "1.0"),

    // Spacer
    new Paragraph({ spacing: { before: 800 }, children: [] }),

    // Footer
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      border: { top: { style: "single" as const, size: 1, color: "334155", space: 8 } },
      children: [
        new TextRun({ text: "Prepared using Giki Actions | Confidential", font: FONT, size: PT(9), color: "94A3B8" })
      ]
    })
  ];
}

function metaLine(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: `${label} `, font: FONT, size: PT(11), bold: true, color: COLORS.WHITE }),
      new TextRun({ text: value, font: FONT, size: PT(11), color: "CBD5E1" })
    ]
  });
}
