"use client";

import type { ReactNode } from "react";
import { DatasetProvider } from "@/lib/blob/dataset-context";

export function DatasetShell({ children }: { children: ReactNode }) {
  return <DatasetProvider>{children}</DatasetProvider>;
}
