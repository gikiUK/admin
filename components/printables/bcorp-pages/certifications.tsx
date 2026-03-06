import { MarkdownContent } from "@/components/printables/markdown-content";
import type { BcorpData } from "@/lib/bcorp/types";

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
    "**Science Based Targets**: We have a validated near-term/long-term science-based target, aligned with 1.5°C."
  ],
  [
    "initiative_smech",
    "**SME Climate Hub Member**: We are a committed member of the SME Climate Hub. This means we are committed to halving greenhouse gas emissions by 2030, achieving net-zero emissions before 2050, and reporting progress annually."
  ]
];

export function Certifications({ data }: { data: BcorpData }) {
  const certifications = CERT_DESCRIPTIONS.filter(([key]) => data[key] === "yes");
  if (certifications.length === 0) return null;

  return (
    <>
      <h3>Certifications</h3>
      <ul>
        {certifications.map(([key, text]) => (
          <li key={key}>
            <MarkdownContent content={text} />
          </li>
        ))}
      </ul>
    </>
  );
}
