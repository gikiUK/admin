import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type KpiCardProps = {
  label: string;
  value: string | number | null;
  hint?: string;
  icon?: LucideIcon;
};

export function KpiCard({ label, value, hint, icon: Icon }: KpiCardProps) {
  return (
    <Card className="gap-1 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
      </div>
      <div className="text-lg font-semibold tracking-tight leading-tight">{value ?? "—"}</div>
      {hint && <div className="text-xs text-muted-foreground leading-snug">{hint}</div>}
    </Card>
  );
}
