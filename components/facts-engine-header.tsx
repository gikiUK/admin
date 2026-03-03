"use client";

import { usePathname } from "next/navigation";
import { AnalysisIndicator } from "@/components/analysis/analysis-indicator";
import { DatasetHeader } from "@/components/dataset/dataset-header";
import { HeaderSaveStatus } from "@/components/dataset/header-save-status";
import { Separator } from "@/components/ui/separator";

export function FactsEngineHeader() {
  const pathname = usePathname();
  if (!pathname.startsWith("/data") && !pathname.startsWith("/docs")) return null;

  return (
    <>
      <Separator orientation="vertical" className="mr-2 !h-4" />
      <AnalysisIndicator />
      <HeaderSaveStatus />
      <div className="ml-auto">
        <DatasetHeader />
      </div>
    </>
  );
}
