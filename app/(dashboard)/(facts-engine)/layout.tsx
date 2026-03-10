import { HistorySidebar } from "@/components/dataset/history-sidebar";
import { AnalysisProvider } from "@/lib/analysis/analysis-context";

export default function FactsEngineLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnalysisProvider>
      {children}
      <HistorySidebar />
    </AnalysisProvider>
  );
}
