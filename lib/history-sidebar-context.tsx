"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

type HistorySidebarContextProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
};

const HistorySidebarContext = createContext<HistorySidebarContextProps | null>(null);

export function useHistorySidebar() {
  const context = useContext(HistorySidebarContext);
  if (!context) {
    throw new Error("useHistorySidebar must be used within a HistorySidebarProvider.");
  }
  return context;
}

export function HistorySidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <HistorySidebarContext.Provider value={{ open, setOpen, toggleOpen: () => setOpen((o) => !o) }}>
      {children}
    </HistorySidebarContext.Provider>
  );
}
