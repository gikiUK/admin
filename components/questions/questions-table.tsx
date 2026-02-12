"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Question } from "@/lib/data/types";
import { ConditionDisplay } from "./condition-display";

type QuestionsTableProps = {
  questions: Question[];
};

function getFactsDisplay(question: Question): string {
  if (question.fact) return question.fact;
  if (question.facts) {
    const keys = Object.keys(question.facts).filter((k) => k !== "defaults");
    return keys.join(", ");
  }
  return "-";
}

export function QuestionsTable({ questions }: QuestionsTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const types = [...new Set(questions.map((q) => q.type))];

  const filtered = questions.filter((q) => {
    if (search && !q.label.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && q.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by label..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {questions.length} questions
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Fact(s)</TableHead>
              <TableHead>Show When</TableHead>
              <TableHead>Hide When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((q) => (
              <TableRow key={q.index}>
                <TableCell className="text-muted-foreground">{q.index + 1}</TableCell>
                <TableCell className="max-w-xs">
                  <span className="text-sm">{q.label}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{q.type}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{getFactsDisplay(q)}</TableCell>
                <TableCell>
                  <ConditionDisplay condition={q.showWhen} />
                </TableCell>
                <TableCell>
                  <ConditionDisplay condition={q.hideWhen} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No questions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
