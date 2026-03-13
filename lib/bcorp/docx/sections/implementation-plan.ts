import type { Paragraph, Table } from "docx";
import type { BcorpData } from "@/lib/bcorp/types";
import { markdownToParagraphs } from "../markdown";
import { bodyText, heading2, heading3, pageBreak } from "../styles";

export function buildImplementationPlan(data: BcorpData): (Paragraph | Table)[] {
  return [
    pageBreak(),
    heading2("Implementation Plan"),
    heading3("Actions Overview"),
    ...(data.actions_overview
      ? markdownToParagraphs(data.actions_overview)
      : [bodyText("[Actions overview to be generated]")])
  ];
}
