"use client";

import type { ReactNode } from "react";
import { PendingBackend } from "@/components/analytics/pending-backend";

type AsyncState<T> =
  | { status: "loading" }
  | { status: "pending-backend" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

type Props<T> = {
  state: AsyncState<T>;
  endpoint: string;
  loadingLabel: string;
  children: (data: T) => ReactNode;
};

export function AsyncSection<T>({ state, endpoint, loadingLabel, children }: Props<T>) {
  return (
    <section className="space-y-3">
      {state.status === "loading" && <div className="text-sm text-muted-foreground">{loadingLabel}</div>}
      {state.status === "pending-backend" && <PendingBackend endpoint={endpoint} />}
      {state.status === "error" && <div className="text-sm text-destructive">{state.message}</div>}
      {state.status === "ready" && children(state.data)}
    </section>
  );
}
