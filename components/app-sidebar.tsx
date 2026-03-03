"use client";

import { usePathname } from "next/navigation";
import { FactsEngineSidebar } from "@/components/facts-engine-sidebar";
import { TopLevelSidebar } from "@/components/top-level-sidebar";
import { useAuth } from "@/lib/auth/auth-context";

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const isFactsEngine = pathname.startsWith("/data") || pathname.startsWith("/docs");

  if (isFactsEngine) {
    return <FactsEngineSidebar pathname={pathname} logout={logout} />;
  }
  return <TopLevelSidebar pathname={pathname} logout={logout} />;
}
