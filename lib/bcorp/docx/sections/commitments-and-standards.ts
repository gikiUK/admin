import type { Table } from "docx";
import { Paragraph } from "docx";
import type { BcorpData } from "@/lib/bcorp/types";
import { markdownToParagraphs } from "../markdown";
import { bodyText, heading2, heading3, pageBreak, simpleTable } from "../styles";

const CERT_DESCRIPTIONS: [string, string][] = [
  [
    "cert_bcorp",
    "**B Corp Certification**: We have been awarded B Corp certification. B Corp certification verifies that a company meets rigorous standards of social and environmental performance, accountability, and transparency, balancing profit with purpose."
  ],
  [
    "cert_iso14001",
    "**ISO 14001**: We are ISO 14001 certified. ISO 14001 is an international standard for environmental management systems that helps organizations minimize their environmental impact and ensure regulatory compliance."
  ],
  [
    "initiative_sbti",
    "**Science Based Targets**: We have a validated near-term/long-term science-based target, aligned with 1.5\u00B0C."
  ],
  [
    "initiative_smech",
    "**SME Climate Hub Member**: We are a committed member of the SME Climate Hub. This means we are committed to halving greenhouse gas emissions by 2030, achieving net-zero emissions before 2050, and reporting progress annually."
  ]
];

const POLICY_DESCRIPTIONS: [string, string][] = [
  [
    "policy_procurement",
    "**Sustainable Procurement Policy**: A policy that establishes environmentally responsible purchasing practices while maintaining business efficiency and cost-effectiveness."
  ],
  [
    "policy_supplier_code",
    "**Supplier Code of Conduct**: A policy that establishes ethical, environmental, and social standards that suppliers must meet when doing business with an organization."
  ],
  [
    "policy_travel",
    "**Sustainable Travel Policy**: A policy that establishes a framework for making sustainable business travel decisions to minimize environmental impact while meeting business needs effectively."
  ],
  [
    "policy_environment",
    "**Environmental Management**: A policy that establishes commitments to reduce environmental impact, ensure legal compliance, and continuously improve environmental performance across operations."
  ]
];

const TARGET_TYPES: [string, string][] = [
  ["target_scope12_interim", "Scope 1 & 2 Short Term Target"],
  ["target_scope3_interim", "Scope 3 Short Term Target"],
  ["target_longterm", "Long Term Target"]
];

export function buildCommitmentsAndStandards(data: BcorpData): (Paragraph | Table)[] {
  const certs = CERT_DESCRIPTIONS.filter(([key]) => data[key] === "yes");
  const policies = POLICY_DESCRIPTIONS.filter(([key]) => data[key] === "yes");
  const targets = TARGET_TYPES.filter(([key]) => data[key]?.trim());
  const hasSmech = data.initiative_smech === "yes";
  const hasSbti = data.initiative_sbti === "yes";

  if (certs.length === 0 && policies.length === 0 && targets.length === 0 && !hasSmech && !hasSbti) return [];

  const elements: (Paragraph | Table)[] = [pageBreak(), heading2("Commitments & Standards")];

  // Certifications
  if (certs.length > 0) {
    elements.push(heading3("Certifications"));
    for (const [, text] of certs) {
      elements.push(...markdownToParagraphs(text).map((p) => new Paragraph({ ...p, bullet: { level: 0 } })));
    }
  }

  // Policies
  if (policies.length > 0) {
    elements.push(
      heading3("Policies"),
      bodyText("We have implemented the following policies to help us achieve our environmental goals:")
    );
    for (const [, text] of policies) {
      elements.push(...markdownToParagraphs(text).map((p) => new Paragraph({ ...p, bullet: { level: 0 } })));
    }
  }

  // Metrics & Targets
  if (hasSmech || hasSbti || targets.length > 0) {
    elements.push(heading3("Metrics & Targets"));
    if (hasSmech) {
      elements.push(
        bodyText(
          "We have signed up to SME Climate Hub. SME Climate Hub is a global initiative that helps small and medium-sized businesses commit to halving emissions by 2030 and achieving net-zero by 2050."
        )
      );
    }
    if (hasSbti) {
      elements.push(
        bodyText(
          "We have a Science Based Target. SBTi (Science Based Targets initiative) provides companies with a framework to set emissions reduction targets aligned with climate science and the goals of the Paris Agreement."
        )
      );
    }
    if (targets.length > 0) {
      elements.push(
        bodyText(
          "We recognize that measurable targets and commitments are essential to track progress and drive accountability. That's why we have included the following targets and commitments in our plan:"
        ),
        simpleTable(
          ["Target Type", "Target"],
          targets.map(([key, label]) => [label, data[key] ?? ""])
        )
      );
      if (data.baseline_year?.trim() && data.baseline_emissions?.trim()) {
        elements.push(
          bodyText(
            `Targets are based on a ${data.baseline_year} baseline when emissions were ${data.baseline_emissions} tCO2e.`
          )
        );
      }
    }
  }

  return elements;
}
