import { FactsTable } from "@/components/facts/facts-table";
import { PageHeader } from "@/components/page-header";
import { loadFacts } from "@/lib/data/facts";

export default function FactsPage() {
  const facts = loadFacts();

  return (
    <div className="space-y-6">
      <PageHeader title="Facts" description="Core and derived facts used by the question engine." />
      <FactsTable facts={facts} />
    </div>
  );
}
