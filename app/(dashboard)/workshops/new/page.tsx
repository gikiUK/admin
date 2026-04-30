"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { WorkshopDetailsForm } from "@/components/workshops/workshop-details-form";
import { createWorkshop, type WorkshopFormData } from "@/lib/workshops/api";

export default function NewWorkshopPage() {
  const router = useRouter();

  async function handleSave(data: WorkshopFormData) {
    const workshop = await createWorkshop(data);
    router.push(`/workshops/${workshop.uuid}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Workshop" description="Create a new workshop and configure its details." />
      <WorkshopDetailsForm onSave={handleSave} />
    </div>
  );
}
