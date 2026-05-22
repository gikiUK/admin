"use client";

import { useQueries } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BcorpDataForm } from "@/components/bcorps/bcorp-data-form";
import { PillTab } from "@/components/bcorps/bcorp-header";
import { PlanJsonExplorer } from "@/components/bcorps/plan-json-explorer";
import { PlanView } from "@/components/bcorps/plan-view";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { fetchBcorpData } from "@/lib/bcorp/api";
import { useBcorpHeader } from "@/lib/bcorp/bcorp-header-context";
import { deriveFromPlan } from "@/lib/bcorp/plan-rules";
import { bcorpKeys, bcorpPlanQuery } from "@/lib/bcorp/queries";
import type { BcorpData } from "@/lib/bcorp/types";

type OrganizationDetailProps = {
  orgId: string;
};

// 404 from /bcorp_data means "no data yet" — return an empty form payload so the
// rule-derived data still drives the UI. Other errors propagate.
async function fetchBcorpDataOrEmpty(orgId: string): Promise<BcorpData> {
  try {
    return await fetchBcorpData(orgId);
  } catch (err) {
    if (err instanceof Error && "status" in err && (err as { status: number }).status === 404) {
      return {} as BcorpData;
    }
    throw err;
  }
}

export function OrganizationDetail({ orgId }: OrganizationDetailProps) {
  const {
    setPlan,
    setOrgId,
    setOrgName,
    populateState,
    isDirty,
    setDirty,
    activeTab,
    setActiveTab,
    setPlanCount,
    setAlreadyDoingCount,
    bcorpFormData,
    setBcorpFormData,
    setBcorpFormReasoning
  } = useBcorpHeader();

  useEffect(() => {
    return () => setDirty(false);
  }, [setDirty]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const [hasPopulated, setHasPopulated] = useState(false);
  useEffect(() => {
    if (populateState === "populating") setHasPopulated(true);
  }, [populateState]);

  const [previewKey, setPreviewKey] = useState(0);
  const prevTabRef = useRef<string>("bcorp");
  const scrollPositions = useRef<Record<string, number>>({});
  useEffect(() => {
    const prev = prevTabRef.current;
    if (prev !== activeTab) {
      scrollPositions.current[prev] = window.scrollY;
      if (activeTab === "preview" && prev !== "preview") setPreviewKey((k) => k + 1);
      prevTabRef.current = activeTab;
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPositions.current[activeTab] ?? 0, behavior: "instant" });
      });
    }
  }, [activeTab]);

  const [planQuery, bcorpDataQuery] = useQueries({
    queries: [bcorpPlanQuery(orgId), { queryKey: bcorpKeys.data(orgId), queryFn: () => fetchBcorpDataOrEmpty(orgId) }]
  });

  const planData = planQuery.data?.plan;
  const alreadyDoing = planQuery.data?.alreadyDoingActions ?? null;
  const bcorpData = bcorpDataQuery.data;

  // Push the loaded data into the bcorp header context. This effect runs once the
  // two queries resolve and re-runs only when their data identities change.
  useEffect(() => {
    if (!planData || !bcorpData) return;
    const { data: ruleData, reasoning: ruleReasoning } = deriveFromPlan(planData);
    const merged = { ...ruleData, ...bcorpData };
    setPlan(planData);
    setOrgId(orgId);
    setOrgName(merged.name);
    setPlanCount(planData.length);
    setAlreadyDoingCount(alreadyDoing?.length ?? 0);
    setBcorpFormData(merged);
    setBcorpFormReasoning(ruleReasoning);
  }, [
    orgId,
    planData,
    alreadyDoing,
    bcorpData,
    setPlan,
    setOrgId,
    setOrgName,
    setPlanCount,
    setAlreadyDoingCount,
    setBcorpFormData,
    setBcorpFormReasoning
  ]);

  useEffect(() => {
    return () => setOrgId("");
  }, [setOrgId]);

  const loading = planQuery.isPending || bcorpDataQuery.isPending;
  const loadError = (() => {
    const err = planQuery.error ?? bcorpDataQuery.error;
    if (!err) return "";
    return err instanceof Error ? err.message : "Failed to load organization";
  })();

  if (loading) return <div className="text-muted-foreground">Loading...</div>;
  if (loadError) return <div className="text-destructive">{loadError}</div>;

  const plan = planData ?? [];

  return (
    <>
      {hasPopulated && (
        <div
          className="fixed top-12 left-0 right-0 z-20 pointer-events-none"
          style={{ height: "3px", opacity: populateState === "populating" ? 1 : 0, transition: "opacity 1s ease" }}
        >
          <style>{`@keyframes rainbow-slide { 0% { background-position: 0% 0% } 50% { background-position: 150% 0% } 100% { background-position: 300% 0% } }`}</style>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, #a855f7, #6366f1, #3b82f6, #06b6d4, #a855f7, #6366f1, #a855f7)",
              backgroundSize: "300% 100%",
              animation: "rainbow-slide 12s ease-in-out infinite",
              opacity: 0.8
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, #a855f7, #6366f1, #3b82f6, #06b6d4, #a855f7, #6366f1, #a855f7)",
              backgroundSize: "300% 100%",
              animation: "rainbow-slide 12s ease-in-out infinite",
              filter: "blur(6px)",
              transform: "scaleY(3)",
              opacity: 0.2
            }}
          />
        </div>
      )}

      <div className="sticky top-12 z-10 flex justify-center -mt-4 pt-1.5 pb-1 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-1.5 py-1 backdrop-blur-md">
          <PillTab value="bcorp" active={activeTab} onClick={setActiveTab}>
            B Corp Data
          </PillTab>
          <div className="flex items-center rounded-full bg-muted/60 overflow-hidden">
            <PillTab value="plan" active={activeTab} onClick={setActiveTab}>
              Plan ({plan.length})
            </PillTab>
            <div className="w-px h-3.5 bg-border/70 shrink-0" />
            <PillTab value="json" active={activeTab} onClick={setActiveTab}>
              JSON
            </PillTab>
          </div>
          <div className="flex items-center rounded-full bg-muted/60 overflow-hidden">
            <PillTab value="already-doing" active={activeTab} onClick={setActiveTab}>
              Already Doing ({alreadyDoing?.length ?? 0})
            </PillTab>
            <div className="w-px h-3.5 bg-border/70 shrink-0" />
            <PillTab value="already-doing-json" active={activeTab} onClick={setActiveTab}>
              JSON
            </PillTab>
          </div>
          <PillTab value="preview" active={activeTab} onClick={setActiveTab}>
            Preview
          </PillTab>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="bcorp" className="mt-3 max-w-[760px]">
          {bcorpFormData !== null && <BcorpDataForm orgId={orgId} initialData={bcorpFormData} />}
        </TabsContent>
        <TabsContent value="plan" className="mt-3 max-w-[760px]">
          <PlanView plan={plan} />
        </TabsContent>
        <TabsContent value="json" className="mt-3">
          <PlanJsonExplorer plan={plan} />
        </TabsContent>
        <TabsContent value="already-doing" className="mt-3 max-w-[760px]">
          <PlanView plan={alreadyDoing ?? []} showFilters={false} />
        </TabsContent>
        <TabsContent value="already-doing-json" className="mt-3">
          <PlanJsonExplorer plan={alreadyDoing ?? []} />
        </TabsContent>
        <TabsContent value="preview" className="mt-3">
          <iframe
            key={previewKey}
            src={`/printables/organizations/${orgId}/bcorp-content`}
            className="w-full rounded border border-border"
            style={{ height: "calc(100vh - 140px)" }}
            title="PDF Preview"
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
