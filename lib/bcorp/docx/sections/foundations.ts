import type { Paragraph, Table } from "docx";
import type { BcorpData } from "@/lib/bcorp/types";
import { markdownToParagraphs } from "../markdown";
import { heading2, heading3, heading4, pageBreak } from "../styles";

export function buildFoundations(data: BcorpData): (Paragraph | Table)[] {
  return [
    pageBreak(),
    heading2("Foundations"),
    heading3("Our Commitment"),
    ...markdownToParagraphs(data.our_commitment ?? ""),
    heading3("Strategic Rationale"),
    heading4("Why This Matters for Our Planet"),
    ...markdownToParagraphs(data.why_planet ?? ""),
    heading4("Why This Matters for Our Business"),
    ...markdownToParagraphs(data.why_business ?? "")
  ];
}
