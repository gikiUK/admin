import type { FieldGetter, FieldSetter } from "@/components/bcorps/form-types";
import { SectionCard } from "@/components/bcorps/ui/section-card";
import { ToggleSection } from "@/components/bcorps/ui/toggle-section";
import { toYesNo } from "@/components/bcorps/ui/yes-no-select";

export function PoliciesSection({ get, set }: { get: FieldGetter; set: FieldSetter }) {
  return (
    <SectionCard title="Policies">
      <ToggleSection
        label="Sustainable Procurement Policy"
        value={get("policy_procurement") === "yes"}
        onChange={(v) => set("policy_procurement", toYesNo(v))}
      />
      <ToggleSection
        label="Supplier Code of Conduct"
        value={get("policy_supplier_code") === "yes"}
        onChange={(v) => set("policy_supplier_code", toYesNo(v))}
      />
      <ToggleSection
        label="Sustainable Travel Policy"
        value={get("policy_travel") === "yes"}
        onChange={(v) => set("policy_travel", toYesNo(v))}
      />
      <ToggleSection
        label="Environmental Management Policy"
        value={get("policy_environment") === "yes"}
        onChange={(v) => set("policy_environment", toYesNo(v))}
      />
    </SectionCard>
  );
}
