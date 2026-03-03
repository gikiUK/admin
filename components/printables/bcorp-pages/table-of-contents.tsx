import { DocHeader } from "@/components/printables/doc-header";
import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

export function TableOfContents(_props: BcorpPageProps) {
  return (
    <div className="ui-page">
      <DocHeader />
      <h1>B Corp Climate Action Certification Plan</h1>
      <h2 style={{ marginTop: 0 }}>Contents</h2>
      <div className="toc-item">
        <strong>Introduction</strong>
      </div>
      <div className="toc-item toc-sub">About Us</div>
      <div className="toc-item toc-sub">Our Climate Action Plan</div>
      <div className="toc-item">
        <strong>Foundations</strong>
      </div>
      <div className="toc-item toc-sub">Our Commitment</div>
      <div className="toc-item toc-sub">Strategic Rationale</div>
      <div className="toc-item toc-sub-sub">Why this matters for our planet</div>
      <div className="toc-item toc-sub-sub">Why this matters for our business</div>
      <div className="toc-item">
        <strong>Implementation Plan</strong>
      </div>
      <div className="toc-item toc-sub">Actions for Direct Emissions &amp; Electricity</div>
      <div className="toc-item toc-sub">Actions for our Value Chain</div>
      <div className="toc-item">
        <strong>Engagement</strong>
      </div>
      <div className="toc-item">
        <strong>Governance</strong>
      </div>
      <div className="toc-item toc-sub">Management and Board</div>
      <div className="toc-item toc-sub">Culture</div>
      <div className="toc-item toc-sub">Learning and Development</div>
      <div className="toc-item">
        <strong>Progress Tracking</strong>
      </div>
      <div className="toc-item">
        <strong>Performance Reporting &amp; Public Disclosure</strong>
      </div>
    </div>
  );
}
