import { notFound } from "next/navigation";
import { FactEditor } from "@/components/facts/fact-editor";
import { getAllFacts, getFactById, getQuestionForFact, getRulesForFact } from "@/lib/data/mock-api";

type FactDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FactDetailPage({ params }: FactDetailPageProps) {
  const { id } = await params;
  const fact = getFactById(id);

  if (!fact) notFound();

  const rules = getRulesForFact(id);
  const question = getQuestionForFact(id);
  const allFactIds = getAllFacts().map((f) => f.id);

  return <FactEditor fact={fact} rules={rules} question={question} allFactIds={allFactIds} />;
}
