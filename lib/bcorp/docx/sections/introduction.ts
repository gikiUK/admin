import type { Paragraph, Table } from "docx";
import type { BcorpData } from "@/lib/bcorp/types";
import { markdownToParagraphs } from "../markdown";
import { bannerParagraph, bodyText, heading2, pageBreak } from "../styles";

export function buildIntroduction(data: BcorpData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [
    pageBreak(),
    bannerParagraph("Climate Action Plan 2025"),
    heading2("Introduction")
  ];

  if (data.company_description) {
    elements.push(...markdownToParagraphs(data.company_description));
  }

  elements.push(
    bodyText(
      "This Climate Action Plan outlines our strategic approach to reducing greenhouse gas emissions across our operations and value chain. The plan demonstrates our commitment to limiting global warming to 1.5\u00B0C through measurable actions, clear accountability, and transparent progress reporting."
    ),
    bodyText(
      "This document includes our climate commitment and strategic rationale, a detailed implementation plan with specific actions across all emission scopes, our approach to stakeholder engagement and governance, and our progress tracking methodology."
    )
  );

  return elements;
}
