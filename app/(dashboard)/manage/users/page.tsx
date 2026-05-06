import { UsersExplorer } from "@/components/manage/users-explorer";
import { PageHeader } from "@/components/page-header";

export default function ManageUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage user accounts, confirmations, and password resets." />
      <UsersExplorer />
    </div>
  );
}
