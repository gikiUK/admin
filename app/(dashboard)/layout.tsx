import { AppSidebar } from "@/components/app-sidebar";
import { DatasetShell } from "@/components/dataset/dataset-shell";
import { FactsEngineHeader } from "@/components/facts-engine-header";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AnalysisProvider } from "@/lib/analysis/analysis-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { HistorySidebarProvider } from "@/lib/history-sidebar-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DatasetShell>
        <AnalysisProvider>
          <HistorySidebarProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <FactsEngineHeader />
                </header>
                <main className="flex-1 p-6">{children}</main>
              </SidebarInset>
            </SidebarProvider>
          </HistorySidebarProvider>
        </AnalysisProvider>
      </DatasetShell>
    </AuthProvider>
  );
}
