"use client";

import { useEffect, useState } from "react";
import { BcorpDataForm } from "@/components/bcorps/bcorp-data-form";
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
  const { setPlan } = useBcorpHeader();
  const [plan, setPlanLocal] = useState<Plan | null>(null);
  const [bcorpData, setBcorpData] = useState<BcorpData | null>(null);
  const [initialReasoning, setInitialReasoning] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [planData, data] = await Promise.all([
          fetchPlan(orgId),
          fetchBcorpData(orgId).catch((err) => {
            if (err instanceof Error && "status" in err && (err as { status: number }).status === 404) return {};
            throw err;
          })
        ]);
        const { data: ruleData, reasoning: ruleReasoning } = deriveFromPlan(planData);
        setPlanLocal(planData);
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
    <Tabs defaultValue="bcorp">
      <TabsList>
        <TabsTrigger value="bcorp">B Corp Data</TabsTrigger>
        <TabsTrigger value="plan">Plan ({plan?.length ?? 0})</TabsTrigger>
      </TabsList>
      <TabsContent value="bcorp" className="mt-6">
        {bcorpData !== null && (
          <BcorpDataForm orgId={orgId} initialData={bcorpData} initialReasoning={initialReasoning} />
        )}
      </TabsContent>
      <TabsContent value="plan" className="mt-6">
        <PlanView plan={plan ?? []} />
      </TabsContent>
    </Tabs>
  );
}
