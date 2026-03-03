"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchPlan, patchBcorpData } from "@/lib/bcorp/api";
import { useBcorpHeader } from "@/lib/bcorp/bcorp-header-context";
import type { BcorpData } from "@/lib/bcorp/types";

export type SaveState = "idle" | "saving" | "saved" | "error";

type BcorpDataFormProps = {
  orgId: string;
  initialData: BcorpData;
};

type YesNo = "yes" | "no" | "";

function yesNo(val: string | undefined): YesNo {
  if (val === "yes" || val === "no") return val;
  return "";
}

function FieldGroup({
  label,
  description,
  children
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}

function YesNoSelect({ value, onChange }: { value: YesNo; onChange: (v: YesNo) => void }) {
  return (
    <div className="inline-flex rounded-md border overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(value === "yes" ? "" : "yes")}
        className={`px-3 py-1.5 text-sm font-medium transition-colors ${value === "yes" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
      >
        Yes
      </button>
      <div className="w-px bg-border" />
      <button
        type="button"
        onClick={() => onChange(value === "no" ? "" : "no")}
        className={`px-3 py-1.5 text-sm font-medium transition-colors ${value === "no" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
      >
        No
      </button>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="rounded-md border p-4 space-y-4">{children}</div>
    </section>
  );
}

export function BcorpDataForm({ orgId, initialData }: BcorpDataFormProps) {
  const { saveRef, setSaveState, populateRef, setPopulateState, setDirty } = useBcorpHeader();
  const [data, setData] = useState<Record<string, string>>({ ...initialData });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  function set(key: string, value: string) {
    setDirty(true);
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function get(key: string): string {
    return data[key] ?? "";
  }

  async function handleSave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveState("saving", "");
    try {
      const saved = await patchBcorpData(orgId, data as BcorpData);
      setData({ ...saved });
      setDirty(false);
      setSaveState("saved", "");
      timerRef.current = setTimeout(() => setSaveState("idle", ""), 2000);
    } catch (err) {
      setSaveState("error", err instanceof Error ? err.message : "Save failed");
    }
  }

  async function handlePopulate() {
    setPopulateState("populating", "");
    try {
      const plan = await fetchPlan(orgId);
      const res = await fetch("/api/bcorp/populate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, plan, existingData: data })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const { data: populated } = await res.json();
      setData((prev) => ({ ...prev, ...populated }));
      setDirty(true);
      setPopulateState("idle", "");
    } catch (err) {
      setPopulateState("error", err instanceof Error ? err.message : "Populate failed");
    }
  }

  // Keep refs current so header can trigger actions
  saveRef.current = handleSave;
  populateRef.current = handlePopulate;

  return (
    <div className="space-y-6">
      <SectionCard title="Company Summary">
        <FieldGroup
          label="Company Description"
          description="A one paragraph summary of the company used in the introduction"
        >
          <Textarea
            rows={4}
            value={get("company_description")}
            onChange={(e) => set("company_description", e.target.value)}
          />
        </FieldGroup>
      </SectionCard>

      <SectionCard title="Sign Off">
        <FieldGroup label="Approval Authority" description="Board / Directors / Trustees / Executive Committee">
          <Input value={get("approval_authority")} onChange={(e) => set("approval_authority", e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Approval Date" description="Date of approval">
          <Input type="date" value={get("approval_date")} onChange={(e) => set("approval_date", e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Review Date" description="Next review date (max 36 months from approval)">
          <Input type="date" value={get("review_date")} onChange={(e) => set("review_date", e.target.value)} />
        </FieldGroup>
      </SectionCard>

      <SectionCard title="Certifications & Initiatives">
        <FieldGroup label="B Corp Certified">
          <YesNoSelect value={yesNo(get("cert_bcorp"))} onChange={(v) => set("cert_bcorp", v)} />
        </FieldGroup>
        <FieldGroup label="ISO 14001 Certified">
          <YesNoSelect value={yesNo(get("cert_iso14001"))} onChange={(v) => set("cert_iso14001", v)} />
        </FieldGroup>
        <FieldGroup label="Signed up to SME Climate Hub">
          <YesNoSelect value={yesNo(get("initiative_smech"))} onChange={(v) => set("initiative_smech", v)} />
        </FieldGroup>
        <FieldGroup label="Has a Science Based Target (SBTi)">
          <YesNoSelect value={yesNo(get("initiative_sbti"))} onChange={(v) => set("initiative_sbti", v)} />
        </FieldGroup>
        <FieldGroup label="Reports through CDP">
          <YesNoSelect value={yesNo(get("reporting_cdp"))} onChange={(v) => set("reporting_cdp", v)} />
        </FieldGroup>
        <FieldGroup label="Has an Ecovadis Rating">
          <YesNoSelect value={yesNo(get("rating_ecovadis"))} onChange={(v) => set("rating_ecovadis", v)} />
        </FieldGroup>
        {get("rating_ecovadis") === "yes" && (
          <FieldGroup label="Ecovadis Rating Level">
            <Input
              value={get("rating_ecovadis_level")}
              onChange={(e) => set("rating_ecovadis_level", e.target.value)}
            />
          </FieldGroup>
        )}
      </SectionCard>

      <SectionCard title="Policies">
        <FieldGroup label="Sustainable Procurement Policy">
          <YesNoSelect value={yesNo(get("policy_procurement"))} onChange={(v) => set("policy_procurement", v)} />
        </FieldGroup>
        <FieldGroup label="Supplier Code of Conduct">
          <YesNoSelect value={yesNo(get("policy_supplier_code"))} onChange={(v) => set("policy_supplier_code", v)} />
        </FieldGroup>
        <FieldGroup label="Sustainable Travel Policy">
          <YesNoSelect value={yesNo(get("policy_travel"))} onChange={(v) => set("policy_travel", v)} />
        </FieldGroup>
        <FieldGroup label="Environmental Management Policy">
          <YesNoSelect value={yesNo(get("policy_environment"))} onChange={(v) => set("policy_environment", v)} />
        </FieldGroup>
      </SectionCard>

      <SectionCard title="Emission Targets">
        <FieldGroup label="Scope 1 & 2 Interim Target" description='e.g. "Reduce by 50% by 2030"'>
          <Input
            value={get("target_scope12_interim")}
            onChange={(e) => set("target_scope12_interim", e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Scope 1 & 2 Long-term Target" description='e.g. "Net zero by 2050"'>
          <Input
            value={get("target_scope12_longterm")}
            onChange={(e) => set("target_scope12_longterm", e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Scope 3 Interim Target" description='e.g. "Reduce by 30% by 2030"'>
          <Input value={get("target_scope3_interim")} onChange={(e) => set("target_scope3_interim", e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Scope 3 Long-term Target" description='e.g. "Net zero by 2050"'>
          <Input
            value={get("target_scope3_longterm")}
            onChange={(e) => set("target_scope3_longterm", e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Baseline Year">
          <Input value={get("target_baseline_year")} onChange={(e) => set("target_baseline_year", e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Baseline Emissions" description="Baseline emissions (tCO2e)">
          <Input
            value={get("target_baseline_emissions")}
            onChange={(e) => set("target_baseline_emissions", e.target.value)}
          />
        </FieldGroup>
      </SectionCard>
    </div>
  );
}
