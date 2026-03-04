import { MarkdownContent } from "@/components/printables/markdown-content";
import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

export function ImplementationPlan({ data }: BcorpPageProps) {
  return (
    <div className="ui-page">
      <div className="ui-section">
        <h2>Implementation Plan</h2>
        <h3>Actions Overview</h3>
        {data.actions_overview ? (
          <MarkdownContent content={data.actions_overview} />
        ) : (
          <p>[Actions overview to be generated]</p>
        )}
      </div>
    </div>
  );
}
