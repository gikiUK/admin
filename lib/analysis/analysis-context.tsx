"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { runAnalysis } from "@/lib/analysis/run-analysis";
import type { AnalysisIssue, AnalysisReport } from "@/lib/analysis/types";
import { useDataset } from "@/lib/blob/use-dataset";

const EMPTY_ISSUES: AnalysisIssue[] = [];

function buildEntityIssueIndex(report: AnalysisReport): Map<string, AnalysisIssue[]> {
  const map = new Map<string, AnalysisIssue[]>();
  for (const check of report.checks) {
    for (const issue of check.issues) {
      for (const ref of issue.refs) {
        const key = `${ref.type}:${ref.id}`;
        const list = map.get(key);
        if (list) {
          list.push(issue);
        } else {
          map.set(key, [issue]);
        }
      }
    }
  }
  return map;
}

type AnalysisContextValue = {
  report: AnalysisReport | null;
  running: boolean;
  rerun: () => void;
  issuesByEntity: Map<string, AnalysisIssue[]>;
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

  const issuesByEntity = useMemo(() => (report ? buildEntityIssueIndex(report) : new Map()), [report]);

  return (
    <AnalysisContext.Provider value={{ report, running, rerun: runNow, issuesByEntity }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within an AnalysisProvider");
  return ctx;
}

export function useEntityIssues(type: string, id: string): AnalysisIssue[] {
  const { issuesByEntity } = useAnalysis();
  return issuesByEntity.get(`${type}:${id}`) ?? EMPTY_ISSUES;
}
