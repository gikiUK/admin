"use client";

import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
};

export function TooltipCard({ title, subtitle, children }: Props) {
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-medium">{title}</div>
      {subtitle && <div className="text-muted-foreground">{subtitle}</div>}
      {children && <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">{children}</div>}
    </div>
  );
}

export function MetricRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <>
      <span>{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </>
  );
}
