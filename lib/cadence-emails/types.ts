/** A role key, e.g. "standard". Display copy for it lives in labels.ts. */
export type RoleKey = string;

/** Who receives something and when it's skipped. Discriminated on `key`. */
export type MinimumRoleRule = {
  key: "minimum_role";
  /** The seniority floor — everyone at or above it receives the email. */
  value: RoleKey;
};

/** Any rule we don't have special handling for — rendered from its key alone. */
export type SimpleRule = {
  key: string;
};

export type CadenceRule = MinimumRoleRule | SimpleRule;

export function isMinimumRoleRule(rule: CadenceRule): rule is MinimumRoleRule {
  return rule.key === "minimum_role" && "value" in rule;
}

export type CadenceEmail = {
  key: string;
  cadence_key: string;
  position: number;
  subject: string;
  preview_text: string;
  body_markdown: string;
  cta_text: string;
  cta_path: string;
  enabled: boolean;
  /**
   * The *effective* set — everything that applies to this email, including what
   * it inherits from its cadence. Never merge these with the cadence's rules.
   * Read-only: PATCH ignores it, as it does key, cadence_key and position.
   */
  rules: CadenceRule[];
};

export type Cadence = {
  key: string;
  /** Completes "Companies that ___" — lowercase, no full stop. */
  entry_condition: string;
  /** Cadence::GAP — the wait between consecutive emails in this cadence. */
  gap_in_days: number;
  rules: CadenceRule[];
  emails: CadenceEmail[];
};

/** Cadences in progression order, each with its emails in send order. */
export type CadencesResponse = {
  cadences: Cadence[];
};

/** Every editable field. PATCH and preview take the same shape, all fields optional. */
export type CadenceEmailPayload = Partial<
  Pick<CadenceEmail, "subject" | "preview_text" | "body_markdown" | "cta_text" | "cta_path" | "enabled">
>;
