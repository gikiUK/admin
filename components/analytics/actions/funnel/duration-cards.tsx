"use client";

import { DurationCard } from "@/components/analytics/actions/funnel/duration-card";
import type { ActionFunnel } from "@/lib/analytics/actions-api";

type Props = {
  durations: ActionFunnel["durations"];
};

export function DurationCards({ durations }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <DurationCard title="Created → In progress" stats={durations.created_to_in_progress} />
      <DurationCard title="In progress → Completed" stats={durations.in_progress_to_completed} />
      <DurationCard title="Created → Completed" stats={durations.created_to_completed} />
    </div>
  );
}
