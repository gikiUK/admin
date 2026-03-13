import type { Table } from "docx";
import { Paragraph } from "docx";
import type { BcorpData, Plan } from "@/lib/bcorp/types";
import { markdownToParagraphs } from "../markdown";
import { heading2, heading3, pageBreak } from "../styles";

const GOVERNANCE_CATEGORIES = [
  "Risk Management",
  "Strategic Planning",
  "Management and Board",
  "Culture",
  "Learning and Development",
  "Policies"
];

function bulletItem(text: string): Paragraph {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 80 } });
}

export function buildEngagementAndGovernance(data: BcorpData, plan: Plan): (Paragraph | Table)[] {
  const hasEngagement = !!data.engagement?.trim();
  const hasGovernment = !!data.government?.trim();

  if (!hasEngagement && !hasGovernment) return [];

  const elements: (Paragraph | Table)[] = [pageBreak()];

  if (hasEngagement) {
    const engagementActions = plan.filter((a) => a.tal_action.ghg_scope?.includes("Engagement"));
    elements.push(heading2("Engagement"), ...markdownToParagraphs(data.engagement ?? ""));
    for (const a of engagementActions) {
      elements.push(bulletItem(a.tal_action.title));
    }
  }

  if (hasGovernment) {
    const governanceActions = plan.filter((a) => a.tal_action.ghg_scope?.includes("Governance"));
    const byCategory: Record<string, string[]> = {};
    for (const a of governanceActions) {
      const cats = (a.tal_action.ghg_category ?? []).filter((c) => GOVERNANCE_CATEGORIES.includes(c));
      const assigned = cats.length > 0 ? cats : ["Other"];
      for (const cat of assigned) {
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(a.tal_action.title);
      }
    }
    const orderedCats = [...GOVERNANCE_CATEGORIES, "Other"].filter((c) => byCategory[c]);

    elements.push(heading2("Governance"), ...markdownToParagraphs(data.government ?? ""));
    for (const cat of orderedCats) {
      elements.push(heading3(`${cat} Actions`));
      for (const title of byCategory[cat]) {
        elements.push(bulletItem(title));
      }
    }
  }

  return elements;
}
