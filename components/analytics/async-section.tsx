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
  /** Text shown during `loading` when no `loadingFallback` is provided. */
  loadingLabel?: string;
  /** Custom skeleton/spinner shown during `loading`. Falls back to `loadingLabel` text. */
  loadingFallback?: ReactNode;
  children: (data: T) => ReactNode;
};

export function AsyncSection<T>({ state, endpoint, loadingLabel, loadingFallback, children }: Props<T>) {
  return (
    <section className="space-y-3">
      {state.status === "loading" &&
        (loadingFallback ?? <div className="text-sm text-muted-foreground">{loadingLabel ?? "Loading…"}</div>)}
      {state.status === "pending-backend" && <PendingBackend endpoint={endpoint} />}
      {state.status === "error" && <div className="text-sm text-destructive">{state.message}</div>}
      {state.status === "ready" && children(state.data)}
    </section>
  );
}
