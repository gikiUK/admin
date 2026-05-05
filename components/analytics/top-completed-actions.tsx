import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TopCompletedActionsProps = {
  items: Array<{ action_type: string; count: number }>;
};

export function TopCompletedActions({ items }: TopCompletedActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top completed action types</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No completions in range.</div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.action_type} className="flex items-baseline justify-between text-sm">
                <span className="truncate">{item.action_type}</span>
                <span className="tabular-nums text-muted-foreground">{item.count}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
