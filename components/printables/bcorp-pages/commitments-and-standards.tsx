import { Certifications } from "@/components/printables/bcorp-pages/certifications";
import { MetricsAndTargets } from "@/components/printables/bcorp-pages/metrics-and-targets";
import { Policies } from "@/components/printables/bcorp-pages/policies";
import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

export function CommitmentsAndStandards({ data }: BcorpPageProps) {
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
