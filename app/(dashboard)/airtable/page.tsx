"use client";

import { useCallback, useEffect, useState } from "react";
import { SyncsTable } from "@/components/airtable/syncs-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { type AirtableSync, fetchSyncs, triggerSync } from "@/lib/airtable/api";

export default function AirtablePage() {
  const [syncs, setSyncs] = useState<AirtableSync[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const loadSyncs = useCallback(() => {
    fetchSyncs()
      .then(setSyncs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load syncs"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSyncs();
  }, [loadSyncs]);

  async function handleSync() {
    setSyncing(true);
    setError("");
    try {
      await triggerSync();
      loadSyncs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger sync");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Airtable"
        description="Sync data from Airtable"
        action={
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        }
      />
      {loading && <div className="text-muted-foreground">Loading...</div>}
      {error && <div className="text-destructive">{error}</div>}
      {!loading && !error && <SyncsTable syncs={syncs} />}
    </div>
  );
}
