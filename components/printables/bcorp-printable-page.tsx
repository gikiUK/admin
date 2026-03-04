"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PrintableLayout } from "@/components/printables/printable-layout";
import { fetchBcorpData, fetchPlan } from "@/lib/bcorp/api";
import type { BcorpData, Plan } from "@/lib/bcorp/types";

export type BcorpPageProps = {
  data: BcorpData;
  plan: Plan;
};

export function BcorpPrintablePage({ children }: { children: (props: BcorpPageProps) => React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BcorpData | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetchBcorpData(id).catch((err) => {
        if (err instanceof Error && "status" in err && (err as { status: number }).status === 404) return {};
        throw err;
      }),
      fetchPlan(id)
    ])
      .then(([bcorpData, planData]) => {
        setData(bcorpData as BcorpData);
        setPlan(planData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load data");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;

  return <PrintableLayout>{children({ data: data ?? {}, plan: plan ?? [] })}</PrintableLayout>;
}
