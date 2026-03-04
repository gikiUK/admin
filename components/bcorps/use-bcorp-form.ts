"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { patchBcorpData } from "@/lib/bcorp/api";
import { useBcorpHeader } from "@/lib/bcorp/bcorp-header-context";
import type { BcorpData } from "@/lib/bcorp/types";

export const DEFAULTS: Partial<BcorpData> = {
  our_commitment: "<p>We are committed to supporting the global ambition to limit global warming to 1.5°C.</p>",
  why_planet:
    "<p>Climate change poses an urgent threat to Earth's ecosystems and communities. Limiting warming to 1.5°C is critical to protect coral reefs, reduce extreme heatwaves, floods and droughts, and prevent biodiversity collapse.</p><p>Every fraction of a degree matters for people around the world who are already facing the impacts of extreme weather, food insecurity, and rising sea levels. The scientific consensus is clear: decisive action today is essential to avoid irreversible consequences and safeguard a liveable planet for current and future generations.</p>",
  why_business:
    "<p>The transition to a low-carbon economy creates significant business opportunities. Companies taking early action can gain competitive advantages through innovation, operational efficiencies, and access to growing sustainable markets.</p><p>Climate change also represents a risk to business continuity. Unchecked warming threatens supply chain resilience, increases operational disruptions and poses direct physical risks including damage to assets from extreme weather. Limiting warming to 1.5°C helps protect physical assets and employees while reducing long-term business uncertainty.</p>",
  engagement:
    "<p>We recognise that achieving our climate ambitions requires working alongside our customers and industry peers — that's why we are committed to engaging in collaborative initiatives where our participation can contribute to collective progress.</p>",
  government:
    "<p>We recognise that delivering our climate ambitions requires robust governance structures, clear accountability, and aligned organisational culture. That's why we are committed to embedding our transition plan across all levels of our organisation, from Board oversight to day-to-day operations.</p>"
};

const AI_FIELDS = ["company_description", "actions_overview", "actions_in_progress", "actions_added"];

export function useBcorpForm(orgId: string, initialData: BcorpData, initialReasoning: Record<string, string>) {
  const { saveRef, setSaveState, populateRef, setPopulateState, setDirty, plan } = useBcorpHeader();
  const orgName = useSearchParams().get("name") ?? orgId;

  const [data, setData] = useState<BcorpData>({ ...DEFAULTS, ...initialData });
  const [reasoning, setReasoning] = useState<Record<string, string>>(initialReasoning);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  function get(key: keyof BcorpData): string {
    return data[key] ?? "";
  }

  function set(key: keyof BcorpData, value: string) {
    setDirty(true);
    setData((prev) => ({ ...prev, [key]: value }));
    setReasoning((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function hint(key: keyof BcorpData) {
    const r = reasoning[key as string];
    if (!r) return {};
    return { hint: r, filled: get(key) !== "" };
  }

  async function handleSave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveState("saving", "");
    try {
      const saved = await patchBcorpData(orgId, data);
      setData({ ...DEFAULTS, ...saved });
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
        body: JSON.stringify({ orgId, orgName, plan, existingData: data })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const { data: llmData, reasoning: llmReasoning } = await res.json();
      setData((prev) => ({ ...prev, ...llmData }));
      setReasoning((prev) => ({ ...(llmReasoning ?? {}), ...prev }));
      setDirty(true);
      setPopulateState("idle", "");
      const filled = AI_FIELDS.filter((k) => llmData[k] !== undefined && llmData[k] !== "").length;
      if (filled > 0)
        toast.success("AI fields populated", { description: `${filled} field${filled !== 1 ? "s" : ""} filled` });
      else toast.info("AI populate", { description: "No fields populated" });
    } catch (err) {
      setPopulateState("error", err instanceof Error ? err.message : "Populate failed");
    }
  }

  saveRef.current = handleSave;
  populateRef.current = handlePopulate;

  return { get, set, hint };
}
