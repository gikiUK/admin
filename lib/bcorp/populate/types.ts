import type { Plan } from "@/lib/bcorp/types";

export type PopulateRequest = {
  orgId: string;
  orgName: string;
  plan: Plan;
  existingData: Record<string, string>;
  fieldsToPopulate?: string[];
};

export type LlmResult = {
  data: Record<string, string>;
  reasoning: Record<string, string>;
};
