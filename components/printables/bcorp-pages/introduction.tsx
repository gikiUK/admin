import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

export function Introduction(props: BcorpPageProps) {
  return (
    <div className="ui-page">
      <div className="plan-title">
        <h2>Climate Action Plan 2025</h2>
      </div>
      <div className="ui-section">
        <h2>Introduction</h2>
        <p>{props.data.company_description}</p>
        <p>
          This Climate Action Plan outlines our strategic approach to reducing greenhouse gas emissions across our
          operations and value chain. The plan demonstrates our commitment to limiting global warming to 1.5&deg;C
          through measurable actions, clear accountability, and transparent progress reporting.
        </p>
        <p>
          This document includes our climate commitment and strategic rationale, a detailed implementation plan with
          specific actions across all emission scopes, our approach to stakeholder engagement and governance, and our
          progress tracking methodology.
        </p>
      </div>
    </div>
  );
}
