import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";
import { MarkdownContent } from "@/components/printables/markdown-content";

export function Foundations({ data }: BcorpPageProps) {
  return (
    <div className="ui-page">
      <div className="ui-section">
        <h2>Foundations</h2>
        <h3>Our Commitment</h3>
        <MarkdownContent content={data.our_commitment ?? ""} />
        <h3>Strategic Rationale</h3>
        <h4>Why This Matters for Our Planet</h4>
        <MarkdownContent content={data.why_planet ?? ""} />
        <h4>Why This Matters for Our Business</h4>
        <MarkdownContent content={data.why_business ?? ""} />
      </div>
    </div>
  );
}
