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
    impact?: string;
    implementation_time?: string;
    complexity?: string;
    [key: string]: unknown;
  };
};

export type Plan = PlanAction[];

export type BcorpData = Record<string, string>;
