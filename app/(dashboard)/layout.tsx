import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/lib/auth/auth-context";
import { QueryProvider } from "@/lib/query/query-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <SidebarProvider>
          <AppSidebar />
          {children}
        </SidebarProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
