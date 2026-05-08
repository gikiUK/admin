"use client";

import { use } from "react";
import { OrgDetail } from "@/components/analytics/org-detail";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function AnalyticsOrgDetailPage({ params }: Props) {
  const { slug } = use(params);
  return <OrgDetail slug={slug} />;
}
