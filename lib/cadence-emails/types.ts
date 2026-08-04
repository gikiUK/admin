/** A role key, e.g. "standard". Display copy for it lives in labels.ts. */
export type RoleKey = string;

/** Who receives something and when it's skipped. Discriminated on `key`. */
export type MinimumRoleRule = {
  key: "minimum_role";
  /** The seniority floor — everyone at or above it receives the email. */
  value: RoleKey;
};

/** Any other rule: it applies when present, and carries `value: true`. */
export type FlagRule = {
  key: string;
  value?: boolean;
};

export type CadenceRule = MinimumRoleRule | FlagRule;

export function isMinimumRoleRule(rule: CadenceRule): rule is MinimumRoleRule {
  return rule.key === "minimum_role";
}

export type CadenceEmail = {
  key: string;
  cadence_key: string;
  position: number;
  subject: string;
  preview_text: string;
  body_markdown: string;
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
export type CadenceEmailPayload = Partial<Pick<CadenceEmail, "subject" | "preview_text" | "body_markdown" | "enabled">>;
