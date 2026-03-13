import { BorderStyle, Paragraph, TextRun } from "docx";
import type { BcorpData, Plan } from "@/lib/bcorp/types";
import { COLORS, FONT, heading1, heading2 } from "../styles";

const PT = (pt: number) => pt * 2;

function tocItem(text: string, bold: boolean, indent = 0): Paragraph {
  const style = bold ? { bold: true, color: COLORS.HEADING } : {};
  return new Paragraph({
    indent: indent ? { left: indent } : undefined,
    spacing: { after: 50 },
    border: {
      bottom: {
        style: indent ? BorderStyle.DOTTED : BorderStyle.SINGLE,
        size: 1,
        color: COLORS.BORDER,
        space: 4
      }
    },
    children: [new TextRun({ text, font: FONT, size: PT(12), ...style })]
  });
}

export function buildTableOfContents(data: BcorpData, plan: Plan): Paragraph[] {
  const hasEngagement = !!data.engagement?.trim();
  const hasGovernment = !!data.government?.trim();
  const hasDisclosure = plan.some((a) => (a.tal_action.themes ?? []).includes("Governance disclosure and reporting"));
  const hasCerts =
    data.cert_bcorp === "yes" ||
    data.cert_iso14001 === "yes" ||
    data.initiative_smech === "yes" ||
    data.initiative_sbti === "yes";
  const hasPolicies =
    data.policy_procurement === "yes" ||
    data.policy_supplier_code === "yes" ||
    data.policy_travel === "yes" ||
    data.policy_environment === "yes";
  const hasTargets =
    data.initiative_smech === "yes" ||
    data.initiative_sbti === "yes" ||
    !!data.target_scope12_interim?.trim() ||
    !!data.target_scope3_interim?.trim() ||
    !!data.target_longterm?.trim();

  const items: Paragraph[] = [
    heading1("B Corp Climate Action Certification Plan"),
    heading2("Contents", { border: { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } } }),
    tocItem("Introduction", true),
    tocItem("About Us", false, 600),
    tocItem("Our Climate Action Plan", false, 600),
    tocItem("Foundations", true),
    tocItem("Our Commitment", false, 600),
    tocItem("Strategic Rationale", false, 600),
    tocItem("Implementation Plan", true),
    tocItem("Actions for Direct Emissions & Electricity", false, 600),
    tocItem("Actions for our Value Chain", false, 600)
  ];

  if (hasEngagement) items.push(tocItem("Engagement", true));
  if (hasGovernment) items.push(tocItem("Governance", true));

  if (hasCerts || hasPolicies || hasTargets) {
    items.push(tocItem("Commitments & Standards", true));
    if (hasCerts) items.push(tocItem("Certifications", false, 600));
    if (hasPolicies) items.push(tocItem("Policies", false, 600));
    if (hasTargets) items.push(tocItem("Metrics & Targets", false, 600));
  }

  items.push(tocItem("Progress Tracking", true));
  if (hasDisclosure) items.push(tocItem("Performance Reporting & Public Disclosure", true));
  items.push(tocItem("Sign Off", true));

  return items;
}
