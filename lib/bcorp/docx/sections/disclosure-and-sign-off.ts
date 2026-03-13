import type { Table } from "docx";
import { Paragraph, TextRun } from "docx";
import type { BcorpData, Plan } from "@/lib/bcorp/types";
import { markdownToParagraphs } from "../markdown";
import { bodyText, borderedBox, heading2, pageBreak } from "../styles";

function bulletItem(text: string): Paragraph {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 80 } });
}

function boldLine(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: `${label} `, bold: true }), new TextRun(value ?? "")]
  });
}

export function buildDisclosureAndSignOff(data: BcorpData, plan: Plan): (Paragraph | Table)[] {
  const disclosureActions = plan.filter((a) =>
    (a.tal_action.themes ?? []).includes("Governance disclosure and reporting")
  );
  const elements: (Paragraph | Table)[] = [pageBreak()];

  if (disclosureActions.length > 0) {
    elements.push(heading2("Performance Reporting & Public Disclosure"));
    if (data.disclosure_intro) elements.push(...markdownToParagraphs(data.disclosure_intro));
    for (const a of disclosureActions) {
      elements.push(bulletItem(a.tal_action.title));
    }
    if (data.reporting_cdp === "yes") {
      elements.push(bodyText("We also report through CDP."));
    }
    if (data.rating_ecovadis === "yes") {
      const suffix = data.rating_ecovadis_level ? ` and achieved ${data.rating_ecovadis_level} status` : "";
      elements.push(bodyText(`We have also been Ecovadis rated${suffix}.`));
    }
    if (data.disclosure_closing) elements.push(...markdownToParagraphs(data.disclosure_closing));
  }

  elements.push(
    heading2("Sign Off"),
    borderedBox([
      boldLine("Approval:", `This plan has been approved by: ${data.approval_authority ?? ""}`),
      boldLine("Date of Approval:", data.approval_date ?? ""),
      boldLine("Next Review Date:", data.review_date ?? "")
    ])
  );

  return elements;
}
