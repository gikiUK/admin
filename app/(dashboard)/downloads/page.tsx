"use client";

import { useCallback, useEffect, useState } from "react";
import { DownloadablesTable } from "@/components/downloads/downloadables-table";
import { PageHeader } from "@/components/page-header";
import { type Downloadable, fetchDownloadables } from "@/lib/downloads/api";

export default function DownloadsPage() {
  const [downloadables, setDownloadables] = useState<Downloadable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetchDownloadables()
      .then(setDownloadables)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load downloadables"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader title="Downloads" description="Manage downloadable resources synced from Airtable" />
      {loading && <div className="text-muted-foreground">Loading...</div>}
      {error && <div className="text-destructive">{error}</div>}
      {!loading && !error && <DownloadablesTable downloadables={downloadables} onChange={load} />}
    </div>
  );
}
