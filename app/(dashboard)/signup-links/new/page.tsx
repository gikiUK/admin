"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { SignupLinkForm } from "@/components/signup-links/form/signup-link-form";
import { createSignupLink } from "@/lib/signup-links/api";
import { signupLinksKeys } from "@/lib/signup-links/queries";
import type { SignupLinkPayload } from "@/lib/signup-links/types";

export default function NewSignupLinkPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleSubmit(payload: SignupLinkPayload) {
    const res = await createSignupLink(payload);
    queryClient.invalidateQueries({ queryKey: signupLinksKeys.all });
    toast.success(`Created "${res.signup_link.title}".`);
    router.push(`/signup-links/${res.signup_link.uuid}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New signup link" description="Create a custom signup URL with optional perks." />
      <SignupLinkForm initial={null} submitLabel="Create signup link" onSubmit={handleSubmit} />
    </div>
  );
}
