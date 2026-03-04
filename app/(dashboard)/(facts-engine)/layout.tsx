import { DatasetShell } from "@/components/dataset/dataset-shell";
import { HistorySidebar } from "@/components/dataset/history-sidebar";
import { AnalysisProvider } from "@/lib/analysis/analysis-context";

export default function FactsEngineLayout({ children }: { children: React.ReactNode }) {
  return (
    <DatasetShell>
      <AnalysisProvider>
        {children}
        <HistorySidebar />
      </AnalysisProvider>
    </DatasetShell>
  );
}
