"use client";

import { BcorpHeader } from "@/components/bcorps/bcorp-header";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { BcorpHeaderProvider, useBcorpHeader } from "@/lib/bcorp/bcorp-header-context";

function BcorpHeaderSlot() {
  const { orgId } = useBcorpHeader();
  if (!orgId) return null;
  return <BcorpHeader orgId={orgId} />;
}

export default function BcorpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BcorpHeaderProvider>
      <SidebarInset>
        <header className="bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <BcorpHeaderSlot />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </BcorpHeaderProvider>
  );
}
