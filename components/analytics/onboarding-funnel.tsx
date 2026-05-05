import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OnboardingFunnelProps = {
  funnel: {
    total_companies: number;
    questions_completed: number;
    actions_completed: number;
  };
};

export function OnboardingFunnel({ funnel }: OnboardingFunnelProps) {
  const { total_companies, questions_completed, actions_completed } = funnel;
  const steps = [
    { label: "Companies", value: total_companies },
    { label: "Finished questions", value: questions_completed },
    { label: "Finished actions", value: actions_completed }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Onboarding funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {total_companies === 0 ? (
          <div className="text-sm text-muted-foreground">No companies yet.</div>
        ) : (
          steps.map((step) => {
            const pct = total_companies === 0 ? 0 : (step.value / total_companies) * 100;
            return (
              <div key={step.label} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{step.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {step.value} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
