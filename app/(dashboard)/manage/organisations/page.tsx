import { OrgsExplorer } from "@/components/manage/orgs-explorer";
import { PageHeader } from "@/components/page-header";

export default function ManageOrganisationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Organisations"
        description="Manage trial periods, gifted premium access, and account lifecycle."
      />
      <OrgsExplorer />
    </div>
  );
}
