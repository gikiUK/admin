"use client";

import { useEffect, useState } from "react";
import { BcorpDataForm } from "@/components/bcorps/bcorp-data-form";
import { fetchBcorpData } from "@/lib/bcorp/api";

import type { BcorpData } from "@/lib/bcorp/types";

type OrganizationDetailProps = {
  orgId: string;
};

export function OrganizationDetail({ orgId }: OrganizationDetailProps) {
  const [bcorpData, setBcorpData] = useState<BcorpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchBcorpData(orgId).catch((err) => {
          if (err instanceof Error && "status" in err && (err as { status: number }).status === 404) return {};
          throw err;
        });
        setBcorpData(data as BcorpData);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load organization");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orgId]);

  if (loading) return <div className="text-muted-foreground">Loading...</div>;
  if (loadError) return <div className="text-destructive">{loadError}</div>;

  return bcorpData !== null ? <BcorpDataForm orgId={orgId} initialData={bcorpData} /> : null;
}
