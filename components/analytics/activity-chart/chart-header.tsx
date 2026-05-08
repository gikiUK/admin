import { CardTitle } from "@/components/ui/card";

type Props = {
  title: string;
  total: number | null;
  delta: number | null;
};

export function ChartHeader({ title, total, delta }: Props) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <CardTitle className="text-base">{title}</CardTitle>
      <div className="flex items-baseline gap-2 text-sm">
        {total !== null && <span className="text-muted-foreground tabular-nums">{total.toLocaleString()} total</span>}
        {total !== null && delta !== null && <DeltaBadge delta={delta} />}
      </div>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  const tone =
    delta === 0
      ? "text-muted-foreground"
      : delta > 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-rose-600 dark:text-rose-400";
  return (
    <span className={`${tone} tabular-nums`}>
      {Number.isFinite(delta) ? `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(0)}% vs prev` : "↑ from 0"}
    </span>
  );
}
