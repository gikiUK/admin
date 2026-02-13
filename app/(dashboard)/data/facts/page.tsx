import { Plus } from "lucide-react";
import Link from "next/link";
import { FactsExplorer } from "@/components/facts/facts-explorer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { loadEnrichedFacts } from "@/lib/data/enriched-facts";

export default function FactsPage() {
  const categories = loadEnrichedFacts();
  const totalCount = categories.reduce((sum, cat) => sum + cat.facts.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facts"
        description="Core and derived facts used by the question engine."
        action={
          <Button asChild>
            <Link href="/data/facts/new">
              <Plus className="size-4" /> New Fact
            </Link>
          </Button>
        }
      />
      <FactsExplorer categories={categories} totalCount={totalCount} />
    </div>
  );
}
