"use client";

import { useEffect, useState } from "react";
import { BcorpDataForm } from "@/components/bcorps/bcorp-data-form";
import { PlanJsonExplorer } from "@/components/bcorps/plan-json-explorer";
import { PlanView } from "@/components/bcorps/plan-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchBcorpData, fetchPlan } from "@/lib/bcorp/api";
import { useBcorpHeader } from "@/lib/bcorp/bcorp-header-context";
import { deriveFromPlan } from "@/lib/bcorp/plan-rules";
import type { BcorpData, Plan } from "@/lib/bcorp/types";

type OrganizationDetailProps = {
  orgId: string;
};

export function OrganizationDetail({ orgId }: OrganizationDetailProps) {
  const { setPlan, populateState, isDirty, setDirty } = useBcorpHeader();

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

  const [plan, setPlanLocal] = useState<Plan | null>(null);
  const [alreadyDoingActions, setAlreadyDoingActions] = useState<Plan | null>(null);
  const [bcorpData, setBcorpData] = useState<BcorpData | null>(null);
  const [initialReasoning, setInitialReasoning] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [{ plan: planData, alreadyDoingActions: alreadyDoing }, data] = await Promise.all([
          fetchPlan(orgId),
          fetchBcorpData(orgId).catch((err) => {
            if (err instanceof Error && "status" in err && (err as { status: number }).status === 404) return {};
            throw err;
          })
        ]);
        const { data: ruleData, reasoning: ruleReasoning } = deriveFromPlan(planData);
        setPlanLocal(planData);
        setAlreadyDoingActions(alreadyDoing);
        setPlan(planData);
        setBcorpData({ ...ruleData, ...(data as BcorpData) });
        setInitialReasoning(ruleReasoning);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load organization");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orgId, setPlan]);

  if (loading) return <div className="text-muted-foreground">Loading...</div>;
  if (loadError) return <div className="text-destructive">{loadError}</div>;

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

      <Tabs defaultValue="bcorp" className="max-w-[760px]">
        <TabsList>
          <TabsTrigger value="bcorp">B Corp Data</TabsTrigger>
          <TabsTrigger value="plan">Plan ({plan?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="already-doing">Already Doing ({alreadyDoingActions?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="already-doing-json">Already Doing JSON</TabsTrigger>
        </TabsList>
        <TabsContent value="bcorp" className="mt-6">
          {bcorpData !== null && (
            <BcorpDataForm orgId={orgId} initialData={bcorpData} initialReasoning={initialReasoning} />
          )}
        </TabsContent>
        <TabsContent value="plan" className="mt-6">
          <PlanView plan={plan ?? []} />
        </TabsContent>
        <TabsContent value="json" className="mt-6">
          <PlanJsonExplorer plan={plan ?? []} />
        </TabsContent>
        <TabsContent value="already-doing" className="mt-6">
          <PlanView plan={alreadyDoingActions ?? []} showFilters={false} />
        </TabsContent>
        <TabsContent value="already-doing-json" className="mt-6">
          <PlanJsonExplorer plan={alreadyDoingActions ?? []} />
        </TabsContent>
      </Tabs>
    </>
  );
}
