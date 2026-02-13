"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FactCategory } from "@/lib/blob/types";
import { FactCategoryGroup } from "./fact-category-group";

type FactsExplorerProps = {
  categories: FactCategory[];
  totalCount: number;
};

export function FactsExplorer({ categories, totalCount }: FactsExplorerProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [coreFilter, setCoreFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        facts: cat.facts.filter((fact) => {
          if (search && !fact.id.toLowerCase().includes(lowerSearch)) return false;
          if (typeFilter !== "all" && fact.type !== typeFilter) return false;
          if (coreFilter === "core" && !fact.core) return false;
          if (coreFilter === "derived" && fact.core) return false;
          return true;
        })
      }))
      .filter((cat) => cat.facts.length > 0);
  }, [categories, search, typeFilter, coreFilter]);

  const filteredCount = filtered.reduce((sum, cat) => sum + cat.facts.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by fact ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="boolean_state">boolean_state</SelectItem>
            <SelectItem value="enum">enum</SelectItem>
            <SelectItem value="array">array</SelectItem>
          </SelectContent>
        </Select>
        <Select value={coreFilter} onValueChange={setCoreFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Core/Derived" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="core">Core</SelectItem>
            <SelectItem value="derived">Derived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredCount} of {totalCount} facts
      </p>

      <div className="space-y-6">
        {filtered.map((cat) => (
          <FactCategoryGroup key={cat.key} label={cat.label} facts={cat.facts} />
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground">No facts found.</p>}
      </div>
    </div>
  );
}
