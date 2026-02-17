import { AppSidebar } from "@/components/app-sidebar";
import { DatasetHeader } from "@/components/dataset/dataset-header";
import { DatasetShell } from "@/components/dataset/dataset-shell";
import { HeaderSaveStatus } from "@/components/dataset/header-save-status";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider } from "@/lib/auth/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DatasetShell>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 !h-4" />
              <HeaderSaveStatus />
              <div className="ml-auto">
                <DatasetHeader />
              </div>
            </header>
            <main className="flex-1 p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </DatasetShell>
    </AuthProvider>
  );
}
