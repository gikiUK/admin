export type Organization = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export type PlanAction = {
  state: string;
  external_action_id: string;
  tal_action: {
    id: string;
    title: string;
    summary?: string;
    benefits?: string;
    ghg_scope?: string[];
    ghg_category?: string[];
    themes?: string[];
    impact_opportunity?: string;
    [key: string]: unknown;
  };
};

export type Plan = PlanAction[];

export type FetchPlanResult = {
  plan: Plan;
  alreadyDoingActions: Plan;
};

export type BcorpData = {
  // Introduction
  company_description?: string;
  // Foundations
  our_commitment?: string;
  why_planet?: string;
  why_business?: string;
  // Implementation Plan
  actions_overview?: string;
  // Engagement, Governance & Disclosure (omit from PDF if empty)
  engagement?: string;
  government?: string;
  disclosure_intro?: string;
  disclosure_closing?: string;
  // Progress Tracking
  actions_in_progress?: string;
  actions_added?: string;
  // Targets
  target_scope12_interim?: string;
  target_scope3_interim?: string;
  target_longterm?: string;
  baseline_year?: string;
  baseline_emissions?: string;
  // Certifications & Initiatives
  cert_bcorp?: string;
  cert_iso14001?: string;
  initiative_smech?: string;
  initiative_sbti?: string;
  reporting_cdp?: string;
  rating_ecovadis?: string;
  rating_ecovadis_level?: string;
  // Policies
  policy_procurement?: string;
  policy_supplier_code?: string;
  policy_travel?: string;
  policy_environment?: string;
  // Sign Off
  approval_authority?: string;
  approval_date?: string;
  review_date?: string;
  [key: string]: string | undefined;
};
