import { DatasetShell } from "@/components/dataset/dataset-shell";
import { HistorySidebar } from "@/components/dataset/history-sidebar";
import { FactsEngineHeaderContent } from "@/components/facts-engine-header";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AnalysisProvider } from "@/lib/analysis/analysis-context";
import { HistorySidebarProvider } from "@/lib/history-sidebar-context";

export default function FactsEngineLayout({ children }: { children: React.ReactNode }) {
  return (
    <HistorySidebarProvider>
      <DatasetShell>
        <AnalysisProvider>
          <SidebarInset>
            <header className="bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <FactsEngineHeaderContent />
            </header>
            <main className="flex-1 p-6">{children}</main>
            <HistorySidebar />
          </SidebarInset>
        </AnalysisProvider>
      </DatasetShell>
    </HistorySidebarProvider>
  );
}
