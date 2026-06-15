"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { SignupLinkDeleteDialog } from "@/components/signup-links/delete-dialog";
import { CompaniesPanel } from "@/components/signup-links/show/companies-panel";
import { CopyLinkRow } from "@/components/signup-links/show/copy-link-row";
import { DetailsPanel } from "@/components/signup-links/show/details-panel";
import { WelcomePagePreview } from "@/components/signup-links/show/welcome-page-preview";
import { Button } from "@/components/ui/button";
import { signupLinkDetailQuery, signupLinksKeys } from "@/lib/signup-links/queries";

export default function SignupLinkShowPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const query = useQuery(signupLinkDetailQuery(uuid));
  const link = query.data?.signup_link;

  if (query.isPending) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (query.isError || !link) {
    return (
      <p className="text-destructive text-sm">
        {query.error instanceof Error ? query.error.message : "Signup link not found"}
      </p>
    );
  }

  function handleDeleted() {
    queryClient.invalidateQueries({ queryKey: signupLinksKeys.all });
    router.push("/signup-links");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={link.title}
        description={`Code: ${link.code}`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/signup-links/${uuid}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        }
      />
      <CopyLinkRow code={link.code} />
      <DetailsPanel link={link} />
      {link.welcome_page_title && link.welcome_page_body && (
        <WelcomePagePreview title={link.welcome_page_title} body={link.welcome_page_body} />
      )}
      <CompaniesPanel uuid={uuid} />
      <SignupLinkDeleteDialog
        link={deleteOpen ? link : null}
        onClose={() => setDeleteOpen(false)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
