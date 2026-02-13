"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { QuestionsThread } from "@/components/questions/questions-thread";
import { Button } from "@/components/ui/button";
import { computeQuestionThread } from "@/lib/blob/derived";
import { useDataset } from "@/lib/blob/use-dataset";

export default function QuestionsPage() {
  const { blob } = useDataset();

  if (!blob) return null;

  const questions = blob.questions;
  const thread = computeQuestionThread(questions);
  const types = [...new Set(questions.map((q) => q.type))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Questions"
        description="Questions presented to users to determine applicable actions."
        action={
          <Button asChild>
            <Link href="/data/questions/new">
              <Plus className="size-4" /> New Question
            </Link>
          </Button>
        }
      />
      <QuestionsThread thread={thread} types={types} totalCount={questions.length} />
    </div>
  );
}
