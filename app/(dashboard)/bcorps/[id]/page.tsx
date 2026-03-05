"use client";

import { useParams } from "next/navigation";
import { OrganizationDetail } from "@/components/bcorps/organization-detail";
import "./styles.css";

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();

  return <OrganizationDetail orgId={id} />;
}
