"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { runAnalysis } from "@/lib/analysis/run-analysis";
import type { AnalysisReport } from "@/lib/analysis/types";
import { useDataset } from "@/lib/blob/use-dataset";

type AnalysisContextValue = {
  report: AnalysisReport | null;
  running: boolean;
  rerun: () => void;
};

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const { blob, loading } = useDataset();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [running, setRunning] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const runNow = useCallback(() => {
    if (!blob) return;
    setRunning(true);
    requestAnimationFrame(() => {
      const result = runAnalysis(blob);
      setReport(result);
      setRunning(false);
    });
  }, [blob]);

  // Auto-run with debounce when blob changes
  useEffect(() => {
    if (!blob || loading) return;

    setRunning(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const result = runAnalysis(blob);
      setReport(result);
      setRunning(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [blob, loading]);

  return <AnalysisContext.Provider value={{ report, running, rerun: runNow }}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within an AnalysisProvider");
  return ctx;
}
