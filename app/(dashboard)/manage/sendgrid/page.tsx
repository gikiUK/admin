import { PageHeader } from "@/components/page-header";
import { SendgridSyncButton } from "@/components/sendgrid/sync-button";

export default function SendgridPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="SendGrid"
        description="Manual catch-up sync for the Tips & Guidance contact list"
        action={<SendgridSyncButton />}
      />
      <p className="text-sm text-muted-foreground max-w-2xl">
        Walks every user and either upserts them onto the Tips &amp; Guidance list with their latest name and company
        details, or removes them if they've opted out of guidance emails. This runs in the background and reports no
        progress or result — there's no sync history to show.
      </p>
    </div>
  );
}
