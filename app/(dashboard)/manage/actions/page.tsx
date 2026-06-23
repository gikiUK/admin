import { ActionsExplorer } from "@/components/manage/actions-explorer";
import { PageHeader } from "@/components/page-header";

export default function ManageActionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Actions" description="Browse and search climate actions by title or Airtable Record ID." />
      <ActionsExplorer />
    </div>
  );
}
