import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";
import { DocHeader } from "@/components/printables/doc-header";

export function TableOfContents({ data, plan }: BcorpPageProps) {
  const hasEngagement = data.engagement && data.engagement.trim() !== "";
  const hasGovernment = data.government && data.government.trim() !== "";
  const hasDisclosure = plan.some((a) =>
    (a.tal_action.themes ?? []).includes("Governance disclosure and reporting")
  );
  const hasCerts =
    data.cert_bcorp === "yes" || data.cert_iso14001 === "yes" ||
    data.initiative_smech === "yes" || data.initiative_sbti === "yes";
  const hasPolicies =
    data.policy_procurement === "yes" || data.policy_supplier_code === "yes" ||
    data.policy_travel === "yes" || data.policy_environment === "yes";
  const hasTargets =
    data.initiative_smech === "yes" || data.initiative_sbti === "yes" ||
    !!data.target_scope12_interim?.trim() || !!data.target_scope3_interim?.trim() || !!data.target_longterm?.trim();

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
      <div className="toc-item">
        <strong>Implementation Plan</strong>
      </div>
      <div className="toc-item toc-sub">Actions for Direct Emissions &amp; Electricity</div>
      <div className="toc-item toc-sub">Actions for our Value Chain</div>
      {hasEngagement && (
        <div className="toc-item">
          <strong>Engagement</strong>
        </div>
      )}
      {hasGovernment && (
        <div className="toc-item">
          <strong>Governance</strong>
        </div>
      )}
      <div className="toc-item">
        <strong>Commitments &amp; Standards</strong>
      </div>
      {hasCerts && <div className="toc-item toc-sub">Certifications</div>}
      {hasPolicies && <div className="toc-item toc-sub">Policies</div>}
      {hasTargets && <div className="toc-item toc-sub">Metrics &amp; Targets</div>}
      <div className="toc-item">
        <strong>Progress Tracking</strong>
      </div>
      {hasDisclosure && (
        <div className="toc-item">
          <strong>Performance Reporting &amp; Public Disclosure</strong>
        </div>
      )}
      <div className="toc-item">
        <strong>Sign Off</strong>
      </div>
    </div>
  );
}
