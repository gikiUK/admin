import { MarkdownContent } from "@/components/printables/markdown-content";
import type { BcorpData } from "@/lib/bcorp/types";

const CERT_DESCRIPTIONS: [string, string][] = [
  [
    "cert_bcorp",
    "**B Corp certification**: We have been awarded B Corp certification. B Corp certification verifies that a company meets rigorous standards of social and environmental performance, accountability, and transparency, balancing profit with purpose."
  ],
  [
    "cert_iso14001",
    "**ISO 14001**: We are ISO 14001 certified. ISO 14001 is an international standard for environmental management systems that helps organizations minimize their environmental impact and ensure regulatory compliance."
  ],
  [
    "initiative_sbti",
    "**Science Based Targets initiative (SBTi)**: We have set a Science Based Target. The SBTi provides a clearly defined pathway for companies to reduce greenhouse gas emissions in line with the goals of the Paris Agreement, ensuring our targets are grounded in climate science."
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
