import { FactEditor } from "@/components/facts/fact-editor";
import { getAllFacts } from "@/lib/data/mock-api";

export default function NewFactPage() {
  const allFactIds = getAllFacts().map((f) => f.id);

  return <FactEditor rules={[]} allFactIds={allFactIds} isNew />;
}
