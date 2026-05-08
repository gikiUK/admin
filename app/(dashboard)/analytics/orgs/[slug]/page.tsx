"use client";

import { useRouter } from "next/navigation";
import { use, useCallback } from "react";
import { OrgDetail } from "@/components/analytics/org-detail";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function AnalyticsOrgDetailPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const handleBack = useCallback(() => router.push("/analytics/orgs"), [router]);

  return <OrgDetail slug={slug} onBack={handleBack} />;
}
