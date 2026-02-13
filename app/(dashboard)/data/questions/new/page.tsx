import { QuestionEditor } from "@/components/questions/question-editor";
import { getConstantGroupNames } from "@/lib/data/constants";
import { getAllFacts } from "@/lib/data/mock-api";
import type { Question } from "@/lib/data/types";
import { createQuestionAction } from "../actions";

export default function NewQuestionPage() {
  const allFactIds = getAllFacts().map((f) => f.id);
  const constantGroupNames = getConstantGroupNames();

  async function handleSave(payload: Partial<Omit<Question, "index">>) {
    "use server";
    await createQuestionAction(payload as Omit<Question, "index">);
  }

  return <QuestionEditor allFactIds={allFactIds} constantGroupNames={constantGroupNames} isNew onSave={handleSave} />;
}
