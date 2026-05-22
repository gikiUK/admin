"use client";

export function CatalogQuadrantLegend() {
  return (
    <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 p-3 text-[10px] uppercase tracking-wide">
      <div className="self-start justify-self-start text-muted-foreground/70">Niche but effective</div>
      <div className="self-start justify-self-end text-emerald-600/80 dark:text-emerald-400/80">Stars</div>
      <div className="self-end justify-self-start text-destructive/70">Kill candidates</div>
      <div className="self-end justify-self-end text-amber-600/80 dark:text-amber-400/80">Popular but failing</div>
    </div>
  );
}
