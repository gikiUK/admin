import { cn } from "@/lib/utils";

export type StackedBarSegment = { key: string; label: string; className: string; count: number };

type StackedBarProps = {
  title: string;
  total: number;
  totalLabel: string;
  segments: StackedBarSegment[];
  rightLabel?: string;
};

export function StackedBar({ title, total, totalLabel, segments, rightLabel }: StackedBarProps) {
  const visible = segments.filter((s) => s.count > 0);
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-foreground">{title}</span>
        <span className="text-muted-foreground">
          {totalLabel}
          {rightLabel && <span className="ml-2 text-foreground">· {rightLabel}</span>}
        </span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {total === 0
          ? null
          : visible.map((s) => (
              <div
                key={s.key}
                className={cn("h-full", s.className)}
                style={{ width: `${(s.count / total) * 100}%` }}
                title={`${s.label}: ${s.count}`}
              />
            ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {segments.map((s) => (
          <span key={s.key} className={cn("inline-flex items-center gap-1.5", s.count === 0 && "opacity-40")}>
            <span className={cn("inline-block size-2 rounded-sm", s.className)} />
            <span>{s.label}</span>
            <span className="font-mono text-foreground">{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
