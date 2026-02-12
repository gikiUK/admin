"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FactDefinition } from "@/lib/data/types";

type FactsTableProps = {
  facts: FactDefinition[];
};

export function FactsTable({ facts }: FactsTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [coreFilter, setCoreFilter] = useState<string>("all");

  const filtered = facts.filter((fact) => {
    if (search && !fact.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && fact.type !== typeFilter) return false;
    if (coreFilter === "core" && !fact.core) return false;
    if (coreFilter === "derived" && fact.core) return false;
    return true;
  });

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
        Showing {filtered.length} of {facts.length} facts
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Core / Derived</TableHead>
              <TableHead>Values</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((fact) => (
              <TableRow key={fact.id}>
                <TableCell className="font-mono text-sm">{fact.id}</TableCell>
                <TableCell>
                  <TypeBadge type={fact.type} />
                </TableCell>
                <TableCell>
                  <Badge variant={fact.core ? "default" : "secondary"}>{fact.core ? "Core" : "Derived"}</Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  {fact.values ? (
                    <span className="text-sm text-muted-foreground">{fact.values.join(", ")}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No facts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const variant = type === "boolean_state" ? "outline" : type === "enum" ? "secondary" : "default";
  return <Badge variant={variant}>{type}</Badge>;
}
