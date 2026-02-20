"use client";

import { useEffect, useState } from "react";
import { ActionCard } from "@/components/actions/action-card";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadActions } from "@/lib/blob/api-client";
import type { Action } from "@/lib/blob/types";
import { useDataset } from "@/lib/blob/use-dataset";

function filterActions(actions: Action[], search: string, status: string): Action[] {
  return actions.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (status === "enabled" && !a.enabled) return false;
    if (status === "disabled" && a.enabled) return false;
    return true;
  });
}

export default function ActionsPage() {
  const { blob } = useDataset();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    loadActions()
      .then(setActions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="py-8 text-center text-muted-foreground">Loading actions...</p>;
  if (error) return <p className="py-8 text-center text-destructive">Failed to load actions: {error}</p>;

  const filtered = filterActions(actions, search, status);
  const conditions = blob?.action_conditions ?? {};
  const facts = blob?.facts ?? {};
  const constants = blob?.constants ?? {};

  return (
    <div className="space-y-6">
      <PageHeader title="Actions" description="Climate actions and their dataset conditions." />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {actions.length} actions
      </p>

      <div className="grid gap-3">
        {filtered.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            condition={conditions[String(action.id)]}
            facts={facts}
            constants={constants}
          />
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No actions found.</p>}
      </div>
    </div>
  );
}
