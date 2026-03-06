import type { FieldGetter, FieldSetter } from "@/components/bcorps/form-types";
import { SectionCard } from "@/components/bcorps/ui/section-card";
import { ToggleSection } from "@/components/bcorps/ui/toggle-section";
import { toYesNo } from "@/components/bcorps/ui/yes-no-select";

export function CertificationsSection({ get, set }: { get: FieldGetter; set: FieldSetter }) {
  return (
    <SectionCard title="Certifications & Initiatives">
      <ToggleSection
        label="B Corp Certified"
        value={get("cert_bcorp") === "yes"}
        onChange={(v) => set("cert_bcorp", toYesNo(v))}
      />
      <ToggleSection
        label="ISO 14001 Certified"
        value={get("cert_iso14001") === "yes"}
        onChange={(v) => set("cert_iso14001", toYesNo(v))}
      />
      <ToggleSection
        label="Signed up to SME Climate Hub"
        value={get("initiative_smech") === "yes"}
        onChange={(v) => set("initiative_smech", toYesNo(v))}
      />
      <ToggleSection
        label="Has a Science Based Target (SBTi)"
        value={get("initiative_sbti") === "yes"}
        onChange={(v) => set("initiative_sbti", toYesNo(v))}
      />
    </SectionCard>
  );
}
