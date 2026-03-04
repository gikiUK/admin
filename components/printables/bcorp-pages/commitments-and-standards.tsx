import { Certifications } from "@/components/printables/bcorp-pages/certifications";
import { MetricsAndTargets } from "@/components/printables/bcorp-pages/metrics-and-targets";
import { Policies } from "@/components/printables/bcorp-pages/policies";
import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

export function CommitmentsAndStandards({ data }: BcorpPageProps) {
  const hasCerts =
    data.cert_bcorp === "yes" || data.cert_iso14001 === "yes" || data.initiative_sbti === "yes";
  const hasPolicies =
    data.policy_procurement === "yes" ||
    data.policy_supplier_code === "yes" ||
    data.policy_travel === "yes" ||
    data.policy_environment === "yes";
  const hasTargets =
    data.initiative_smech === "yes" ||
    data.initiative_sbti === "yes" ||
    !!data.target_scope12_interim?.trim() ||
    !!data.target_scope3_interim?.trim() ||
    !!data.target_longterm?.trim();

  if (!hasCerts && !hasPolicies && !hasTargets) return null;

  return (
    <div className="ui-page">
      <div className="ui-section">
        <h2>Commitments &amp; Standards</h2>
        <Certifications data={data} />
        <Policies data={data} />
        <MetricsAndTargets data={data} />
      </div>
    </div>
  );
}
