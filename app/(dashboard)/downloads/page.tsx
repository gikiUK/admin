"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DownloadablesTable } from "@/components/downloads/downloadables-table";
import { PageHeader } from "@/components/page-header";
import { downloadablesQuery, downloadsKeys } from "@/lib/downloads/queries";

export default function DownloadsPage() {
  const queryClient = useQueryClient();
  const query = useQuery(downloadablesQuery());

  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to load downloadables"
    : "";

  return (
    <div className="space-y-6">
      <PageHeader title="Downloads" description="Manage downloadable resources synced from Airtable" />
      {query.isPending && <div className="text-muted-foreground">Loading...</div>}
      {errorMessage && <div className="text-destructive">{errorMessage}</div>}
      {!query.isPending && !errorMessage && (
        <DownloadablesTable
          downloadables={query.data ?? []}
          onChange={() => queryClient.invalidateQueries({ queryKey: downloadsKeys.list() })}
        />
      )}
    </div>
  );
}
