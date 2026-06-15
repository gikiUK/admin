"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { SignupLinkForm } from "@/components/signup-links/form/signup-link-form";
import { updateSignupLink } from "@/lib/signup-links/api";
import { signupLinkDetailQuery, signupLinksKeys } from "@/lib/signup-links/queries";
import type { SignupLinkPayload } from "@/lib/signup-links/types";

export default function EditSignupLinkPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery(signupLinkDetailQuery(uuid));

  const link = query.data?.signup_link;

  async function handleSubmit(payload: SignupLinkPayload) {
    const res = await updateSignupLink(uuid, payload);
    queryClient.setQueryData(signupLinksKeys.detail(uuid), res);
    queryClient.invalidateQueries({ queryKey: signupLinksKeys.all });
    toast.success("Saved.");
    router.push(`/signup-links/${res.signup_link.uuid}`);
  }

  if (query.isPending) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (query.isError || !link) {
    return (
      <p className="text-destructive text-sm">
        {query.error instanceof Error ? query.error.message : "Signup link not found"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit "${link.title}"`} description={`Code: ${link.code}`} />
      <SignupLinkForm initial={link} submitLabel="Save changes" onSubmit={handleSubmit} />
    </div>
  );
}
