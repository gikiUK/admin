"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { RuleCard } from "@/components/rules/rule-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BlobRule } from "@/lib/blob/types";
import { useDataset } from "@/lib/blob/use-dataset";

type IndexedRule = BlobRule & { index: number };

function filterRules(rules: IndexedRule[], search: string, source: string, status: string): IndexedRule[] {
  return rules.filter((r) => {
    if (search && !r.sets.toLowerCase().includes(search.toLowerCase())) return false;
    if (source !== "all" && r.source !== source) return false;
    if (status === "enabled" && !r.enabled) return false;
    if (status === "disabled" && r.enabled) return false;
    return true;
  });
}

export default function RulesPage() {
  const { blob } = useDataset();
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");

  if (!blob) return null;

  const indexedRules: IndexedRule[] = blob.rules.map((r, i) => ({ ...r, index: i }));
  const filtered = filterRules(indexedRules, search, source, status);

  return (
    <div className="space-y-6">
      <PageHeader title="Rules" description="Rules that derive fact values based on conditions." />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by fact ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="general">general</SelectItem>
            <SelectItem value="hotspot">hotspot</SelectItem>
          </SelectContent>
        </Select>
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
        Showing {filtered.length} of {blob.rules.length} rules
      </p>

      <div className="grid gap-3">
        {filtered.map((rule) => (
          <RuleCard key={`rule-${rule.index}`} rule={rule} facts={blob.facts} constants={blob.constants} />
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No rules found.</p>}
      </div>
    </div>
  );
}
