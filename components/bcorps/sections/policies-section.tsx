import type { FieldGetter, FieldHint, FieldSetter } from "@/components/bcorps/form-types";
import { FieldGroup } from "@/components/bcorps/ui/field-group";
import { SectionCard } from "@/components/bcorps/ui/section-card";
import { YesNoSelect, yesNo } from "@/components/bcorps/ui/yes-no-select";

export function PoliciesSection({ get, set, hint }: { get: FieldGetter; set: FieldSetter; hint: FieldHint }) {
  return (
    <SectionCard title="Policies">
      <FieldGroup label="Sustainable Procurement Policy" {...hint("policy_procurement")}>
        <YesNoSelect value={yesNo(get("policy_procurement"))} onChange={(v) => set("policy_procurement", v)} />
      </FieldGroup>
      <FieldGroup label="Supplier Code of Conduct" {...hint("policy_supplier_code")}>
        <YesNoSelect value={yesNo(get("policy_supplier_code"))} onChange={(v) => set("policy_supplier_code", v)} />
      </FieldGroup>
      <FieldGroup label="Sustainable Travel Policy" {...hint("policy_travel")}>
        <YesNoSelect value={yesNo(get("policy_travel"))} onChange={(v) => set("policy_travel", v)} />
      </FieldGroup>
      <FieldGroup label="Environmental Management Policy" {...hint("policy_environment")}>
        <YesNoSelect value={yesNo(get("policy_environment"))} onChange={(v) => set("policy_environment", v)} />
      </FieldGroup>
    </SectionCard>
  );
}
