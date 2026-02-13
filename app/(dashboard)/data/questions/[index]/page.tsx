import { notFound } from "next/navigation";
import { QuestionEditor } from "@/components/questions/question-editor";
import { getConstantGroupNames } from "@/lib/data/constants";
import { getAllFacts, getQuestionByIndex } from "@/lib/data/mock-api";
import type { Question } from "@/lib/data/types";
import { deleteQuestionAction, updateQuestionAction } from "../actions";

type QuestionDetailPageProps = {
  params: Promise<{ index: string }>;
};

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { index: indexStr } = await params;
  const index = Number.parseInt(indexStr, 10);

  if (Number.isNaN(index)) notFound();

  const question = getQuestionByIndex(index);
  if (!question) notFound();

  const allFactIds = getAllFacts().map((f) => f.id);
  const constantGroupNames = getConstantGroupNames();

  async function handleSave(payload: Partial<Omit<Question, "index">>) {
    "use server";
    await updateQuestionAction(index, payload);
  }

  async function handleDelete() {
    "use server";
    await deleteQuestionAction(index);
  }

  return (
    <QuestionEditor
      question={question}
      allFactIds={allFactIds}
      constantGroupNames={constantGroupNames}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
