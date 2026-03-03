"use client";

import { Info } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { patchBcorpData } from "@/lib/bcorp/api";
import { useBcorpHeader } from "@/lib/bcorp/bcorp-header-context";

import type { BcorpData } from "@/lib/bcorp/types";

export type SaveState = "idle" | "saving" | "saved" | "error";

type BcorpDataFormProps = {
  orgId: string;
  initialData: BcorpData;
  initialReasoning?: Record<string, string>;
};

type YesNo = "yes" | "no" | "";

function yesNo(val: string | undefined): YesNo {
  if (val === "yes" || val === "no") return val;
  return "";
}

function FieldGroup({
  label,
  description,
  hint,
  filled,
  children
}: {
  label: string;
  description?: string;
  hint?: string;
  filled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Label>{label}</Label>
        {hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className={`size-3.5 shrink-0 cursor-default ${filled ? "text-muted-foreground/50" : "text-amber-500"}`}
                />
              </TooltipTrigger>
              <TooltipContent className="max-w-60">{hint}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
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

export function BcorpDataForm({ orgId, initialData, initialReasoning = {} }: BcorpDataFormProps) {
  const { saveRef, setSaveState, populateRef, setPopulateState, setDirty, plan } = useBcorpHeader();
  const [data, setData] = useState<Record<string, string>>({ ...initialData });
  const [reasoning, setReasoning] = useState<Record<string, string>>(initialReasoning);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  function set(key: string, value: string) {
    setDirty(true);
    setData((prev) => ({ ...prev, [key]: value }));
    setReasoning((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function get(key: string): string {
    return data[key] ?? "";
  }

  // hint props for a field — only shown after populate has run
  function hint(key: string) {
    const r = reasoning[key];
    if (!r) return {};
    return { hint: r, filled: get(key) !== "" };
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
      const res = await fetch("/api/bcorp/populate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, plan, existingData: data })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const { data: llmData, reasoning: llmReasoning } = await res.json();
      // Keep rule-derived reasoning for fields already set by rules
      setData((prev) => ({ ...prev, ...llmData }));
      setReasoning((prev) => ({ ...(llmReasoning ?? {}), ...prev }));
      setDirty(true);
      setPopulateState("idle", "");

      const filled = (keys: string[]) => keys.filter((k) => llmData[k] !== undefined && llmData[k] !== "").length;
      const GROUP_A = [
        "company_description",
        "cert_bcorp",
        "cert_iso14001",
        "initiative_smech",
        "initiative_sbti",
        "reporting_cdp",
        "rating_ecovadis",
        "rating_ecovadis_level"
      ];
      const GROUP_B = ["policy_procurement", "policy_supplier_code", "policy_travel", "policy_environment"];
      const GROUP_C = [
        "target_scope12_interim",
        "target_scope12_longterm",
        "target_scope3_interim",
        "target_scope3_longterm",
        "target_baseline_year",
        "target_baseline_emissions"
      ];

      const aCount = filled(GROUP_A);
      const bCount = filled(GROUP_B);
      const cCount = filled(GROUP_C);

      if (aCount > 0)
        toast.success(`Certifications & description`, {
          description: `${aCount} field${aCount !== 1 ? "s" : ""} populated`
        });
      else toast.info("Certifications & description", { description: "No fields populated" });

      if (bCount > 0) toast.success("Policies", { description: `${bCount} field${bCount !== 1 ? "s" : ""} populated` });
      else toast.info("Policies", { description: "No fields populated" });

      if (cCount > 0)
        toast.success("Emission targets", { description: `${cCount} field${cCount !== 1 ? "s" : ""} populated` });
      else toast.info("Emission targets", { description: "No fields populated" });
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
          {...hint("company_description")}
        >
          <Textarea
            rows={4}
            value={get("company_description")}
            onChange={(e) => set("company_description", e.target.value)}
          />
        </FieldGroup>
      </SectionCard>

      <SectionCard title="Sign Off">
        <FieldGroup
          label="Approval Authority"
          description="Board / Directors / Trustees / Executive Committee"
          {...hint("approval_authority")}
        >
          <Input value={get("approval_authority")} onChange={(e) => set("approval_authority", e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Approval Date" description="Date of approval" {...hint("approval_date")}>
          <Input type="date" value={get("approval_date")} onChange={(e) => set("approval_date", e.target.value)} />
        </FieldGroup>
        <FieldGroup
          label="Review Date"
          description="Next review date (max 36 months from approval)"
          {...hint("review_date")}
        >
          <Input type="date" value={get("review_date")} onChange={(e) => set("review_date", e.target.value)} />
        </FieldGroup>
      </SectionCard>

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
        <FieldGroup label="Reports through CDP" {...hint("reporting_cdp")}>
          <YesNoSelect value={yesNo(get("reporting_cdp"))} onChange={(v) => set("reporting_cdp", v)} />
        </FieldGroup>
        <FieldGroup label="Has an Ecovadis Rating" {...hint("rating_ecovadis")}>
          <YesNoSelect value={yesNo(get("rating_ecovadis"))} onChange={(v) => set("rating_ecovadis", v)} />
        </FieldGroup>
        {get("rating_ecovadis") === "yes" && (
          <FieldGroup label="Ecovadis Rating Level" {...hint("rating_ecovadis_level")}>
            <Input
              value={get("rating_ecovadis_level")}
              onChange={(e) => set("rating_ecovadis_level", e.target.value)}
            />
          </FieldGroup>
        )}
      </SectionCard>

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

      <SectionCard title="Emission Targets">
        <FieldGroup
          label="Scope 1 & 2 Interim Target"
          description='e.g. "Reduce by 50% by 2030"'
          {...hint("target_scope12_interim")}
        >
          <Input
            value={get("target_scope12_interim")}
            onChange={(e) => set("target_scope12_interim", e.target.value)}
          />
        </FieldGroup>
        <FieldGroup
          label="Scope 1 & 2 Long-term Target"
          description='e.g. "Net zero by 2050"'
          {...hint("target_scope12_longterm")}
        >
          <Input
            value={get("target_scope12_longterm")}
            onChange={(e) => set("target_scope12_longterm", e.target.value)}
          />
        </FieldGroup>
        <FieldGroup
          label="Scope 3 Interim Target"
          description='e.g. "Reduce by 30% by 2030"'
          {...hint("target_scope3_interim")}
        >
          <Input value={get("target_scope3_interim")} onChange={(e) => set("target_scope3_interim", e.target.value)} />
        </FieldGroup>
        <FieldGroup
          label="Scope 3 Long-term Target"
          description='e.g. "Net zero by 2050"'
          {...hint("target_scope3_longterm")}
        >
          <Input
            value={get("target_scope3_longterm")}
            onChange={(e) => set("target_scope3_longterm", e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Baseline Year" {...hint("target_baseline_year")}>
          <Input value={get("target_baseline_year")} onChange={(e) => set("target_baseline_year", e.target.value)} />
        </FieldGroup>
        <FieldGroup
          label="Baseline Emissions"
          description="Baseline emissions (tCO2e)"
          {...hint("target_baseline_emissions")}
        >
          <Input
            value={get("target_baseline_emissions")}
            onChange={(e) => set("target_baseline_emissions", e.target.value)}
          />
        </FieldGroup>
      </SectionCard>
    </div>
  );
}
