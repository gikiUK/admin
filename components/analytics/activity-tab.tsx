"use client";

import { AtRiskOrgs } from "@/components/analytics/at-risk-orgs";
import { EmailHealth } from "@/components/analytics/email-health";
import { EventsTimeSeries } from "@/components/analytics/events-time-series";
import { InvitationsFunnel } from "@/components/analytics/invitations-funnel";
import { StatusDistribution } from "@/components/analytics/status-distribution";
import { TopActionTypes } from "@/components/analytics/top-action-types";
import { TopCompletedActions } from "@/components/analytics/top-completed-actions";
import type { AnalyticsSummary } from "@/lib/analytics/api";

type ActivityTabProps = {
  data: AnalyticsSummary;
};

export function ActivityTab({ data }: ActivityTabProps) {
  return (
    <div className="space-y-4">
      <EventsTimeSeries data={data.events_over_time ?? []} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusDistribution distribution={data.status_distribution} />
        <AtRiskOrgs orgs={data.at_risk_orgs} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopActionTypes items={data.top_action_types ?? []} />
        <TopCompletedActions items={data.top_completed_action_types} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InvitationsFunnel funnel={data.invitations_funnel} />
        <EmailHealth health={data.email_health} />
      </div>
    </div>
  );
}
