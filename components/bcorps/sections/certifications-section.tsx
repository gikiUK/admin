import type { FieldGetter, FieldHint, FieldSetter } from "@/components/bcorps/form-types";
import { FieldGroup } from "@/components/bcorps/ui/field-group";
import { SectionCard } from "@/components/bcorps/ui/section-card";
import { YesNoSelect, yesNo } from "@/components/bcorps/ui/yes-no-select";

export function CertificationsSection({ get, set, hint }: { get: FieldGetter; set: FieldSetter; hint: FieldHint }) {
  return (
    <SectionCard title="Certifications & Initiatives">
      <FieldGroup label="B Corp Certified" {...hint("cert_bcorp")}>
        <YesNoSelect value={yesNo(get("cert_bcorp"))} onChange={(v) => set("cert_bcorp", v)} />
      </FieldGroup>
      <FieldGroup label="ISO 14001 Certified" {...hint("cert_iso14001")}>
        <YesNoSelect value={yesNo(get("cert_iso14001"))} onChange={(v) => set("cert_iso14001", v)} />
      </FieldGroup>
      <FieldGroup label="Signed up to SME Climate Hub" {...hint("initiative_smech")}>
        <YesNoSelect value={yesNo(get("initiative_smech"))} onChange={(v) => set("initiative_smech", v)} />
      </FieldGroup>
      <FieldGroup label="Has a Science Based Target (SBTi)" {...hint("initiative_sbti")}>
        <YesNoSelect value={yesNo(get("initiative_sbti"))} onChange={(v) => set("initiative_sbti", v)} />
      </FieldGroup>
    </SectionCard>
  );
}
