"use client";

import { useParams } from "next/navigation";
import { QuestionEditor } from "@/components/questions/question-editor";
import { useDataset } from "@/lib/blob/use-dataset";

export default function QuestionDetailPage() {
  const { index: indexStr } = useParams<{ index: string }>();
  const { blob } = useDataset();

  const index = Number.parseInt(indexStr, 10);

  if (!blob) return null;
  if (Number.isNaN(index)) return <div className="p-6 text-muted-foreground">Invalid question index.</div>;

  return <QuestionEditor questionIndex={index} />;
}
