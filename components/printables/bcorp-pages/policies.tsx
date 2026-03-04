import { MarkdownContent } from "@/components/printables/markdown-content";
import type { BcorpData } from "@/lib/bcorp/types";

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

export function Policies({ data }: { data: BcorpData }) {
  const policies = POLICY_DESCRIPTIONS.filter(([key]) => data[key] === "yes");
  if (policies.length === 0) return null;

  return (
    <>
      <h3>Policies</h3>
      <p>We have implemented the following policies to help us achieve our environmental goals:</p>
      <ul>
        {policies.map(([key, text]) => (
          <li key={key}>
            <MarkdownContent content={text} />
          </li>
        ))}
      </ul>
    </>
  );
}
