import type { FieldGetter, FieldSetter } from "@/components/bcorps/form-types";
import { SectionCard } from "@/components/bcorps/ui/section-card";
import { ToggleSection } from "@/components/bcorps/ui/toggle-section";
import { YesNoSelect, yesNo } from "@/components/bcorps/ui/yes-no-select";

export function PoliciesSection({ get, set }: { get: FieldGetter; set: FieldSetter }) {
  return (
    <SectionCard title="Policies">
      <ToggleSection label="Sustainable Procurement Policy">
        <YesNoSelect value={yesNo(get("policy_procurement"))} onChange={(v) => set("policy_procurement", v)} />
      </ToggleSection>
      <ToggleSection label="Supplier Code of Conduct">
        <YesNoSelect value={yesNo(get("policy_supplier_code"))} onChange={(v) => set("policy_supplier_code", v)} />
      </ToggleSection>
      <ToggleSection label="Sustainable Travel Policy">
        <YesNoSelect value={yesNo(get("policy_travel"))} onChange={(v) => set("policy_travel", v)} />
      </ToggleSection>
      <ToggleSection label="Environmental Management Policy">
        <YesNoSelect value={yesNo(get("policy_environment"))} onChange={(v) => set("policy_environment", v)} />
      </ToggleSection>
    </SectionCard>
  );
}
