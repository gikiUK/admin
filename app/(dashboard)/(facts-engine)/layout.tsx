import { HistorySidebar } from "@/components/dataset/history-sidebar";

export default function FactsEngineLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <HistorySidebar />
    </>
  );
}
