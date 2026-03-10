import { Award, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function HomePage() {
  return (
    <SidebarInset>
      <header className="bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
      </header>
      <main className="flex-1 p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
          <h1 className="text-4xl font-semibold">Giki Admin</h1>
          <div className="flex gap-4">
            <Button asChild size="lg" variant="outline">
              <Link href="/bcorps">
                <Award />
                BCorps
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/data/facts">
                <Zap />
                Facts Engine
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </SidebarInset>
  );
}
