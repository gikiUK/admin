"use client";

import { createContext, useContext, useRef, useState } from "react";
import type { SaveState } from "@/components/bcorps/bcorp-data-form";
import type { BcorpData, Plan } from "@/lib/bcorp/types";

export type PopulateState = "idle" | "populating" | "error";

type BcorpHeaderContextValue = {
  saveState: SaveState;
  saveError: string;
  setSaveState: (state: SaveState, error: string) => void;
  saveRef: React.MutableRefObject<(() => Promise<void>) | null>;
  populateState: PopulateState;
  populateError: string;
  setPopulateState: (state: PopulateState, error: string) => void;
  populateRef: React.MutableRefObject<(() => Promise<void>) | null>;
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  orgName: string;
  setOrgName: (name: string) => void;
  plan: Plan;
  setPlan: (plan: Plan) => void;
  allAiFilled: boolean;
  setAllAiFilled: (filled: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  planCount: number;
  setPlanCount: (n: number) => void;
  alreadyDoingCount: number;
  setAlreadyDoingCount: (n: number) => void;
  bcorpFormData: BcorpData | null;
  setBcorpFormData: (data: BcorpData) => void;
  bcorpFormReasoning: Record<string, string>;
  setBcorpFormReasoning: (r: Record<string, string>) => void;
};

const BcorpHeaderContext = createContext<BcorpHeaderContextValue | null>(null);

export function BcorpHeaderProvider({ children }: { children: React.ReactNode }) {
  const [saveState, setSaveStateRaw] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const saveRef = useRef<(() => Promise<void>) | null>(null);

  const [populateState, setPopulateStateRaw] = useState<PopulateState>("idle");
  const [populateError, setPopulateError] = useState("");
  const populateRef = useRef<(() => Promise<void>) | null>(null);

  const [isDirty, setDirty] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [plan, setPlan] = useState<Plan>([]);
  const [allAiFilled, setAllAiFilled] = useState(false);
  const [activeTab, setActiveTab] = useState("bcorp");
  const [planCount, setPlanCount] = useState(0);
  const [alreadyDoingCount, setAlreadyDoingCount] = useState(0);
  const [bcorpFormData, setBcorpFormData] = useState<BcorpData | null>(null);
  const [bcorpFormReasoning, setBcorpFormReasoning] = useState<Record<string, string>>({});

  function setSaveState(state: SaveState, error: string) {
    setSaveStateRaw(state);
    setSaveError(error);
  }

  function setPopulateState(state: PopulateState, error: string) {
    setPopulateStateRaw(state);
    setPopulateError(error);
  }

  return (
    <BcorpHeaderContext.Provider
      value={{
        saveState,
        saveError,
        setSaveState,
        saveRef,
        populateState,
        populateError,
        setPopulateState,
        populateRef,
        isDirty,
        setDirty,
        orgName,
        setOrgName,
        plan,
        setPlan,
        allAiFilled,
        setAllAiFilled,
        activeTab,
        setActiveTab,
        planCount,
        setPlanCount,
        alreadyDoingCount,
        setAlreadyDoingCount,
        bcorpFormData,
        setBcorpFormData,
        bcorpFormReasoning,
        setBcorpFormReasoning
      }}
    >
      {children}
    </BcorpHeaderContext.Provider>
  );
}

export function useBcorpHeader() {
  const ctx = useContext(BcorpHeaderContext);
  if (!ctx) throw new Error("useBcorpHeader must be used within BcorpHeaderProvider");
  return ctx;
}
