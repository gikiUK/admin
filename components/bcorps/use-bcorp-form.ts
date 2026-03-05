"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { patchBcorpData } from "@/lib/bcorp/api";
import { useBcorpHeader } from "@/lib/bcorp/bcorp-header-context";
import type { BcorpData } from "@/lib/bcorp/types";

export const GOVERNANCE_CATEGORIES = [
  "Risk Management",
  "Strategic Planning",
  "Management and Board",
  "Culture",
  "Learning and Development",
  "Policies"
];

const AI_FIELDS = ["company_description", "actions_overview", "actions_in_progress", "actions_added"];

export function useBcorpForm(orgId: string, initialData: BcorpData, initialReasoning: Record<string, string>) {
  const { saveRef, setSaveState, populateRef, setPopulateState, setDirty, plan, populateState, setAllAiFilled } =
    useBcorpHeader();
  const orgName = useSearchParams().get("name") ?? orgId;

  const [data, setData] = useState<BcorpData>({ ...initialData });
  const [reasoning, setReasoning] = useState<Record<string, string>>(initialReasoning);

  useEffect(() => {
    const allFilled = AI_FIELDS.every((k) => (initialData[k as keyof BcorpData] ?? "") !== "");
    setAllAiFilled(allFilled);
  }, [initialData, setAllAiFilled]);
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
    const isAI = AI_FIELDS.includes(key as string);
    const isPopulating = isAI && populateState === "populating";
    const r = reasoning[key as string];
    return {
      ...(isAI ? { isAI: true, aiHasData: get(key) !== "" } : {}),
      ...(isPopulating ? { isPopulating: true } : {}),
      ...(r ? { hint: r, filled: get(key) !== "" } : {})
    };
  }

  async function handleSave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveState("saving", "");
    try {
      const saved = await patchBcorpData(orgId, data);
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
        body: JSON.stringify({ orgId, orgName, plan, existingData: data })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const { data: llmData, reasoning: llmReasoning } = await res.json();
      setData((prev) => {
        const next = { ...prev, ...llmData };
        const allFilled = AI_FIELDS.every((k) => (next[k as keyof BcorpData] ?? "") !== "");
        setAllAiFilled(allFilled);
        return next;
      });
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
