import type { BcorpData } from "@/lib/bcorp/types";

export type FieldGetter = (key: keyof BcorpData) => string;
export type FieldSetter = (key: keyof BcorpData, value: string) => void;
export type FieldHint = (key: keyof BcorpData) => {
  hint?: string;
  filled?: boolean;
  isAI?: boolean;
  isPopulating?: boolean;
  aiHasData?: boolean;
  onAiGenerate?: () => void;
};
