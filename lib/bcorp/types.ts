export type Organization = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export type PlanAction = {
  state: string;
  external_action_id: string;
  action_data: {
    title: string;
    summary?: string;
    overview?: string;
    benefits?: string;
    business_rationale?: string;
    impact?: string;
    implementation_time?: string;
    cost_saving?: string;
    complexity?: string;
    investment_requirement?: string;
    growth_potential?: string;
    scopes?: string[];
    groups?: {
      themes?: string[];
      ghg_categories?: string[];
      impact?: string[];
      timeline?: string[];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};

export type Plan = PlanAction[];

export type BcorpData = Record<string, string>;
