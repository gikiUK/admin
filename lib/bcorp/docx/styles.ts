import type { IParagraphOptions, IRunOptions, IStylesOptions } from "docx";
import {
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from "docx";

// ── Colours ──────────────────────────────────────────────────────────────────
export const COLORS = {
  PRIMARY_BLUE: "1D4ED8",
  HEADING: "222222",
  BODY_TEXT: "71717A",
  MUTED: "A1A1AA",
  SCOPE_1: "1D4ED8",
  SCOPE_2: "9333EA",
  SCOPE_3: "16A34A",
  SCOPE_OTHER: "6B7280",
  TABLE_HEADER_BG: "1D4ED8",
  TABLE_STRIPE_BG: "F8FAFC",
  BORDER: "E5E7EB",
  WHITE: "FFFFFF",
  DARK_BG: "0F1B3D",
  LIGHT_BLUE: "93C5FD"
} as const;

export const FONT = "Source Sans 3";

// Half-point conversions (docx uses half-points for font size)
const PT = (pt: number) => pt * 2;

// ── Document-level styles ────────────────────────────────────────────────────
export function documentStyles(): IStylesOptions {
  return {
    default: {
      document: {
        run: { font: FONT, size: PT(12.5), color: COLORS.BODY_TEXT },
        paragraph: { spacing: { after: 140 } }
      },
      heading1: {
        run: { font: FONT, size: PT(30), bold: true, color: COLORS.HEADING },
        paragraph: { spacing: { before: 0, after: 240 } }
      },
      heading2: {
        run: { font: FONT, size: PT(24), bold: true, color: COLORS.HEADING },
        paragraph: {
          spacing: { before: 380, after: 160 },
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: COLORS.PRIMARY_BLUE, space: 6 } }
        }
      },
      heading3: {
        run: { font: FONT, size: PT(14), bold: true, color: COLORS.HEADING },
        paragraph: { spacing: { before: 280, after: 100 } }
      },
      heading4: {
        run: { font: FONT, size: PT(12), bold: true, color: COLORS.PRIMARY_BLUE },
        paragraph: { spacing: { before: 120, after: 60 } }
      },
      listParagraph: {
        run: { font: FONT, size: PT(12.5), color: COLORS.BODY_TEXT }
      }
    }
  };
}

// ── Heading helpers ──────────────────────────────────────────────────────────
export function heading1(text: string): Paragraph {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}

export function heading2(text: string, opts?: Partial<IParagraphOptions>): Paragraph {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)], ...opts });
}

export function heading3(text: string): Paragraph {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
}

export function heading4(text: string): Paragraph {
  return new Paragraph({ heading: HeadingLevel.HEADING_4, children: [new TextRun(text)] });
}

// ── Text helpers ─────────────────────────────────────────────────────────────
export function bodyText(text: string, opts?: Partial<IRunOptions>): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, ...opts })] });
}

export function pageBreak(): Paragraph {
  return new Paragraph({ children: [], pageBreakBefore: true });
}

// ── Table helpers ────────────────────────────────────────────────────────────
function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    children: [
      new Paragraph({ children: [new TextRun({ text, bold: true, color: COLORS.WHITE, font: FONT, size: PT(10) })] })
    ],
    shading: { type: ShadingType.SOLID, color: COLORS.TABLE_HEADER_BG },
    ...(width ? { width: { size: width, type: WidthType.PERCENTAGE } } : {})
  });
}

function dataCell(children: (TextRun | Paragraph)[], striped: boolean, width?: number): TableCell {
  const paragraphChildren: Paragraph[] = [];
  const runChildren: TextRun[] = [];

  for (const child of children) {
    if (child instanceof Paragraph) paragraphChildren.push(child);
    else runChildren.push(child);
  }
  if (runChildren.length > 0) {
    paragraphChildren.unshift(new Paragraph({ children: runChildren }));
  }
  if (paragraphChildren.length === 0) {
    paragraphChildren.push(new Paragraph({ children: [] }));
  }

  return new TableCell({
    children: paragraphChildren,
    ...(striped ? { shading: { type: ShadingType.SOLID, color: COLORS.TABLE_STRIPE_BG } } : {}),
    ...(width ? { width: { size: width, type: WidthType.PERCENTAGE } } : {})
  });
}

export function tableHeaderRow(cells: string[], widths?: number[]): TableRow {
  return new TableRow({
    children: cells.map((text, i) => headerCell(text, widths?.[i])),
    tableHeader: true
  });
}

export function tableDataRow(cells: (TextRun | Paragraph)[][], index: number, widths?: number[]): TableRow {
  const striped = index % 2 === 1;
  return new TableRow({
    children: cells.map((children, i) => dataCell(children, striped, widths?.[i]))
  });
}

export function simpleTable(headers: string[], rows: string[][], widths?: number[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableHeaderRow(headers, widths),
      ...rows.map((row, i) =>
        tableDataRow(
          row.map((text) => [new TextRun({ text, font: FONT, size: PT(10.5) })]),
          i,
          widths
        )
      )
    ]
  });
}

// ── Scope / Category labels ──────────────────────────────────────────────────
export function scopeLabel(scope: string): TextRun {
  const match = scope.match(/^Scope (\d)/);
  let bg: string = COLORS.SCOPE_OTHER;
  if (match) {
    const n = Number.parseInt(match[1], 10);
    if (n === 1) bg = COLORS.SCOPE_1;
    else if (n === 2) bg = COLORS.SCOPE_2;
    else if (n === 3) bg = COLORS.SCOPE_3;
  }
  return new TextRun({
    text: ` ${scope} `,
    font: FONT,
    size: PT(9),
    bold: true,
    color: COLORS.WHITE,
    shading: { type: ShadingType.SOLID, color: bg }
  });
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  "mobile combustion": { bg: "DBEAFE", fg: "1D4ED8" },
  "stationary combustion": { bg: "E0EEFF", fg: "1D4ED8" },
  electricity: { bg: "F3E8FF", fg: "9333EA" },
  "business travel": { bg: "F5EDFF", fg: "9333EA" },
  "purchased goods": { bg: "DCFCE7", fg: "16A34A" },
  "capital goods": { bg: "E6FAED", fg: "16A34A" },
  upstream: { bg: "DBEAFE", fg: "1D4ED8" },
  waste: { bg: "EDE5FB", fg: "9333EA" },
  commuting: { bg: "D4F7E0", fg: "16A34A" },
  "sold products": { bg: "EDFCF2", fg: "16A34A" },
  "leased assets": { bg: "DBEAFE", fg: "1D4ED8" }
};

function categoryColor(category: string): { bg: string; fg: string } {
  const lower = category.toLowerCase();
  for (const [key, colors] of Object.entries(CATEGORY_COLORS)) {
    if (lower.includes(key)) return colors;
  }
  return { bg: "DCFCE7", fg: "16A34A" };
}

export function categoryLabel(category: string): TextRun {
  const displayName = category.replace(/^(?:Cat \d+ - |Scope \d+ - )/, "");
  const colors = categoryColor(category);
  return new TextRun({
    text: ` ${displayName} `,
    font: FONT,
    size: PT(9),
    bold: true,
    color: colors.fg,
    shading: { type: ShadingType.SOLID, color: colors.bg }
  });
}

// ── Banner (blue background paragraph) ───────────────────────────────────────
export function bannerParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    shading: { type: ShadingType.SOLID, color: COLORS.PRIMARY_BLUE },
    spacing: { before: 0, after: 280 },
    children: [new TextRun({ text, font: FONT, size: PT(21), bold: true, color: COLORS.WHITE })]
  });
}

// ── Bordered box (single-cell table) ─────────────────────────────────────────
export function borderedBox(children: Paragraph[]): Table {
  const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children,
            borders: { top: border, bottom: border, left: border, right: border }
          })
        ]
      })
    ]
  });
}
