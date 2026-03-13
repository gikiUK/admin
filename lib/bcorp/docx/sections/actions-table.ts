import { Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import type { Plan, PlanAction } from "@/lib/bcorp/types";
import { bodyText, COLORS, categoryLabel, FONT, heading3, pageBreak, scopeLabel, tableHeaderRow } from "../styles";

const PT = (pt: number) => pt * 2;
const COL_WIDTHS = [48, 15, 37];

function actionRow(action: PlanAction, index: number): TableRow {
  const striped = index % 2 === 1;
  const shading = striped ? { type: "solid" as const, color: COLORS.TABLE_STRIPE_BG } : undefined;

  const scopes = action.tal_action.ghg_scope ?? [];
  const scopeRuns: TextRun[] = [];
  for (const s of scopes) {
    if (scopeRuns.length > 0) scopeRuns.push(new TextRun({ text: " ", font: FONT, size: PT(9) }));
    scopeRuns.push(scopeLabel(s));
  }

  const categories = action.tal_action.ghg_category ?? [];
  const catRuns: TextRun[] = [];
  for (const c of categories) {
    if (catRuns.length > 0) catRuns.push(new TextRun({ text: " ", font: FONT, size: PT(9) }));
    catRuns.push(categoryLabel(c));
  }

  return new TableRow({
    children: [
      new TableCell({
        width: { size: COL_WIDTHS[0], type: WidthType.PERCENTAGE },
        shading,
        children: [
          new Paragraph({ children: [new TextRun({ text: action.tal_action.title, font: FONT, size: PT(10.5) })] })
        ]
      }),
      new TableCell({
        width: { size: COL_WIDTHS[1], type: WidthType.PERCENTAGE },
        shading,
        children: [new Paragraph({ children: scopeRuns.length > 0 ? scopeRuns : [new TextRun("")] })]
      }),
      new TableCell({
        width: { size: COL_WIDTHS[2], type: WidthType.PERCENTAGE },
        shading,
        children: [new Paragraph({ children: catRuns.length > 0 ? catRuns : [new TextRun("")] })]
      })
    ]
  });
}

function scopedTable(title: string, subtitle: string, actions: Plan): (Paragraph | Table)[] {
  if (actions.length === 0) return [];

  return [
    heading3(title),
    bodyText(subtitle, { bold: true, color: COLORS.PRIMARY_BLUE, size: PT(11) }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [tableHeaderRow(["Title", "Scope", "GHG Category"], COL_WIDTHS), ...actions.map((a, i) => actionRow(a, i))]
    })
  ];
}

export function buildActionsTable(plan: Plan): (Paragraph | Table)[] {
  const scope12 = plan.filter((a) =>
    (a.tal_action.ghg_scope ?? []).some((s) => s.startsWith("Scope 1") || s.startsWith("Scope 2"))
  );
  const scope3 = plan.filter((a) => (a.tal_action.ghg_scope ?? []).some((s) => s.startsWith("Scope 3")));

  if (scope12.length === 0 && scope3.length === 0) return [];

  return [
    pageBreak(),
    ...scopedTable("Actions for Direct Emissions & Electricity", "Scope 1 & 2 Emissions Actions", scope12),
    ...scopedTable("Actions for our Value Chain", "Scope 3 Emissions Actions", scope3)
  ];
}
