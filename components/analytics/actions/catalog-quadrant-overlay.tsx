"use client";

export type QuadrantPoint = {
  id: string;
  x: number;
  y: number;
  size: number;
  title: string;
  adoption_count: number;
  completion_count: number;
  completion_rate: number;
  quadrant: "star" | "niche" | "popular_failing" | "kill" | "boundary";
};

export const QUADRANT_COLORS: Record<QuadrantPoint["quadrant"], string> = {
  star: "hsl(140, 60%, 40%)",
  niche: "hsl(190, 55%, 45%)",
  popular_failing: "hsl(35, 70%, 50%)",
  kill: "hsl(0, 65%, 55%)",
  boundary: "hsl(220, 8%, 55%)"
};

type TooltipRenderArgs = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
};

export function QuadrantTooltip({ active, payload }: TooltipRenderArgs) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as QuadrantPoint;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-medium">{point.title}</div>
      <div className="text-muted-foreground">{quadrantLabel(point.quadrant)}</div>
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
        <span>Adoption</span>
        <span className="text-right text-foreground">{point.adoption_count}</span>
        <span>Completed</span>
        <span className="text-right text-foreground">{point.completion_count}</span>
        <span>Completion</span>
        <span className="text-right text-foreground">{(point.completion_rate * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

export function QuadrantLegend() {
  return (
    <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 p-3 text-[10px] uppercase tracking-wide">
      <div className="self-start justify-self-start text-muted-foreground/70">Niche but effective</div>
      <div className="self-start justify-self-end text-emerald-600/80 dark:text-emerald-400/80">Stars</div>
      <div className="self-end justify-self-start text-destructive/70">Kill candidates</div>
      <div className="self-end justify-self-end text-amber-600/80 dark:text-amber-400/80">Popular but failing</div>
    </div>
  );
}

function quadrantLabel(q: QuadrantPoint["quadrant"]) {
  switch (q) {
    case "star":
      return "Star — high adoption, high completion";
    case "niche":
      return "Niche but effective";
    case "popular_failing":
      return "Popular but failing";
    case "kill":
      return "Kill candidate";
    default:
      return "On the median";
  }
}
