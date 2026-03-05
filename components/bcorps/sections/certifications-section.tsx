import type { FieldGetter, FieldSetter } from "@/components/bcorps/form-types";
import { SectionCard } from "@/components/bcorps/ui/section-card";
import { ToggleSection } from "@/components/bcorps/ui/toggle-section";
import { YesNoSelect, yesNo } from "@/components/bcorps/ui/yes-no-select";

export function CertificationsSection({ get, set }: { get: FieldGetter; set: FieldSetter }) {
  return (
    <SectionCard title="Certifications & Initiatives">
      <ToggleSection label="B Corp Certified">
        <YesNoSelect value={yesNo(get("cert_bcorp"))} onChange={(v) => set("cert_bcorp", v)} />
      </ToggleSection>
      <ToggleSection label="ISO 14001 Certified">
        <YesNoSelect value={yesNo(get("cert_iso14001"))} onChange={(v) => set("cert_iso14001", v)} />
      </ToggleSection>
      <ToggleSection label="Signed up to SME Climate Hub">
        <YesNoSelect value={yesNo(get("initiative_smech"))} onChange={(v) => set("initiative_smech", v)} />
      </ToggleSection>
      <ToggleSection label="Has a Science Based Target (SBTi)">
        <YesNoSelect value={yesNo(get("initiative_sbti"))} onChange={(v) => set("initiative_sbti", v)} />
      </ToggleSection>
    </SectionCard>
  );
}
