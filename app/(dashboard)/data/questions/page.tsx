import { PageHeader } from "@/components/page-header";
import { QuestionsTable } from "@/components/questions/questions-table";
import { loadQuestions } from "@/lib/data/questions";

export default function QuestionsPage() {
  const questions = loadQuestions();

  return (
    <div className="space-y-6">
      <PageHeader title="Questions" description="Questions presented to users to determine applicable actions." />
      <QuestionsTable questions={questions} />
    </div>
  );
}
