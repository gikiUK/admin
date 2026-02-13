"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ThreadNode } from "@/lib/blob/derived";
import type { QuestionType } from "@/lib/blob/types";
import { QuestionThreadGroup } from "./question-thread-group";

type QuestionsThreadProps = {
  thread: ThreadNode[];
  types: QuestionType[];
  totalCount: number;
};

function nodeMatchesSearch(node: ThreadNode, search: string): boolean {
  return node.question.label.toLowerCase().includes(search);
}

function nodeMatchesType(node: ThreadNode, typeFilter: string): boolean {
  return typeFilter === "all" || node.question.type === typeFilter;
}

function filterThread(thread: ThreadNode[], search: string, typeFilter: string): ThreadNode[] {
  const lowerSearch = search.toLowerCase();

  return thread.reduce<ThreadNode[]>((acc, node) => {
    const parentMatches = nodeMatchesSearch(node, lowerSearch) && nodeMatchesType(node, typeFilter);
    const matchingChildren = node.children.filter(
      (child) => nodeMatchesSearch(child, lowerSearch) && nodeMatchesType(child, typeFilter)
    );

    // Parent matches -> show with all children
    if (parentMatches) {
      acc.push({ ...node, children: typeFilter === "all" ? node.children : matchingChildren });
      return acc;
    }

    // Child matches -> show parent with only matching children
    if (matchingChildren.length > 0) {
      acc.push({ ...node, children: matchingChildren });
      return acc;
    }

    return acc;
  }, []);
}

function countQuestions(thread: ThreadNode[]): number {
  return thread.reduce((sum, node) => sum + 1 + node.children.length, 0);
}

export function QuestionsThread({ thread, types, totalCount }: QuestionsThreadProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = search || typeFilter !== "all" ? filterThread(thread, search, typeFilter) : thread;
  const visibleCount = countQuestions(filtered);

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
        Showing {visibleCount} of {totalCount} questions
      </p>

      <div className="space-y-3">
        {filtered.map((node) => (
          <QuestionThreadGroup key={node.question.index} node={node} />
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No questions found.</p>}
      </div>
    </div>
  );
}
