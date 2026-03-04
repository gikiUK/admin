import type { FieldGetter, FieldHint, FieldSetter } from "@/components/bcorps/form-types";
import { FieldGroup } from "@/components/bcorps/ui/field-group";
import { SectionCard } from "@/components/bcorps/ui/section-card";
import { Input } from "@/components/ui/input";

export function EmissionTargetsSection({ get, set, hint }: { get: FieldGetter; set: FieldSetter; hint: FieldHint }) {
  return (
    <SectionCard title="Emission Targets">
      <FieldGroup
        label="Scope 1 & 2 Interim Target"
        description='e.g. "Reduce by 50% by 2030"'
        {...hint("target_scope12_interim")}
      >
        <Input value={get("target_scope12_interim")} onChange={(e) => set("target_scope12_interim", e.target.value)} />
      </FieldGroup>
      <FieldGroup
        label="Scope 3 Interim Target"
        description='e.g. "Reduce by 30% by 2030"'
        {...hint("target_scope3_interim")}
      >
        <Input value={get("target_scope3_interim")} onChange={(e) => set("target_scope3_interim", e.target.value)} />
      </FieldGroup>
      <FieldGroup label="Long-term Target" description='e.g. "Net zero by 2050"' {...hint("target_longterm")}>
        <Input value={get("target_longterm")} onChange={(e) => set("target_longterm", e.target.value)} />
      </FieldGroup>
      <FieldGroup label="Baseline Year" description='e.g. "2023"' {...hint("baseline_year")}>
        <Input value={get("baseline_year")} onChange={(e) => set("baseline_year", e.target.value)} />
      </FieldGroup>
      <FieldGroup label="Baseline Emissions (tCO2e)" description='e.g. "1250"' {...hint("baseline_emissions")}>
        <Input value={get("baseline_emissions")} onChange={(e) => set("baseline_emissions", e.target.value)} />
      </FieldGroup>
    </SectionCard>
  );
}
