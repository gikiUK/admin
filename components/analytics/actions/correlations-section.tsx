"use client";

import { ForestPlot } from "@/components/analytics/actions/forest-plot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionCorrelations } from "@/lib/analytics/actions-api";

type Props = {
  data: ActionCorrelations;
};

export function CorrelationsSection({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">What predicts completion?</CardTitle>
        <p className="text-xs text-muted-foreground">
          Each row compares actions that have the factor vs. those that don't. Dot = completion-rate lift, line = 95% CI
          (Newcombe), dot size scales with sample size. Rows need ≥30 in the smaller group to compute a lift. Sample of{" "}
          {data.total_sample.toLocaleString()} tracked actions.
        </p>
      </CardHeader>
      <CardContent>
        <ForestPlot factors={data.factors} />
      </CardContent>
    </Card>
  );
}
