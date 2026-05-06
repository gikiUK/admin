"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset>
      <header className="bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
      </header>
      <main className="flex-1 p-6">{children}</main>
    </SidebarInset>
  );
}
