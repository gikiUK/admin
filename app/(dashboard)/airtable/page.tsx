"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SyncsTable } from "@/components/airtable/syncs-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { triggerSync } from "@/lib/airtable/api";
import { airtableKeys, syncsQuery } from "@/lib/airtable/queries";

export default function AirtablePage() {
  const queryClient = useQueryClient();
  const syncs = useQuery(syncsQuery());

  const trigger = useMutation({
    mutationFn: triggerSync,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: airtableKeys.syncs() })
  });

  const errorMessage = (() => {
    if (trigger.isError) return trigger.error instanceof Error ? trigger.error.message : "Failed to trigger sync";
    if (syncs.isError) return syncs.error instanceof Error ? syncs.error.message : "Failed to load syncs";
    return "";
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Airtable"
        description="Sync data from Airtable"
        action={
          <Button onClick={() => trigger.mutate()} disabled={trigger.isPending}>
            {trigger.isPending ? "Syncing..." : "Sync Now"}
          </Button>
        }
      />
      {syncs.isPending && <div className="text-muted-foreground">Loading...</div>}
      {errorMessage && <div className="text-destructive">{errorMessage}</div>}
      {!syncs.isPending && !syncs.isError && <SyncsTable syncs={syncs.data ?? []} />}
    </div>
  );
}
