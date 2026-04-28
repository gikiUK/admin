"use client";

import { Loader2, Plus, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { QuestionsThread } from "@/components/questions/questions-thread";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ApiError, seedQuestions } from "@/lib/blob/api-client";
import { computeQuestionThread } from "@/lib/blob/derived";
import { useDataset } from "@/lib/blob/use-dataset";

export default function QuestionsPage() {
  const { blob } = useDataset();
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (!blob) return null;

  const questions = blob.questions;
  const thread = computeQuestionThread(questions);
  const types = [...new Set(questions.map((q) => q.type))];

  async function handleReset(event: React.MouseEvent) {
    event.preventDefault();
    setResetting(true);
    try {
      await seedQuestions();
      toast.success("Questions reset from seeds");
      window.location.reload();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to reset questions";
      toast.error(message);
      setResetting(false);
      setResetOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Questions"
        description="Questions presented to users to determine applicable actions."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setResetOpen(true)}>
              <RotateCcw className="size-4" /> Reset Questions from Seeds
            </Button>
            <Button asChild>
              <Link href="/data/questions/new">
                <Plus className="size-4" /> New Question
              </Link>
            </Button>
          </div>
        }
      />
      <QuestionsThread thread={thread} types={types} totalCount={questions.length} />

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset questions from seeds?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all existing questions with the seed data. Any custom changes to questions will be lost.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={resetting} onClick={handleReset}>
              {resetting && <Loader2 className="size-4 animate-spin" />}
              Reset Questions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
