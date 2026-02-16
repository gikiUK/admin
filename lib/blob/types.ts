// ── Condition types ──────────────────────────────────────

export type SimpleCondition = Record<string, string | boolean | number | number[] | string[]>;

export type AnyCondition = { any: SimpleCondition[] };

export type BlobCondition = SimpleCondition | AnyCondition;

// ── Fact ─────────────────────────────────────────────────

export type FactType = "boolean_state" | "enum" | "array";

export type BlobFact = {
  type: FactType;
  core: boolean;
  category?: string;
  values_ref?: string;
  enabled: boolean;
};

// ── Question ─────────────────────────────────────────────

export type QuestionType = "boolean_state" | "single-select" | "multi-select" | "checkbox-radio-hybrid";

export type BlobOption = {
  label: string;
  value: string;
  exclusive?: boolean;
};

export type BlobQuestion = {
  type: QuestionType;
  label: string;
  description?: string;
  fact?: string;
  facts?: Record<string, Record<string, string | boolean>>;
  options?: BlobOption[];
  options_ref?: string;
  show_when?: BlobCondition;
  hide_when?: BlobCondition;
  unknowable?: boolean;
  enabled: boolean;
};

// ── Rule ─────────────────────────────────────────────────

export type BlobRule = {
  sets: string;
  value: boolean | string;
  source: "general" | "hotspot";
  when: BlobCondition;
  enabled: boolean;
};

// ── Action condition ─────────────────────────────────────

export type BlobDismissOption = {
  label: string;
  sets: Record<string, boolean | string> | null;
};

export type BlobActionCondition = {
  enabled: boolean;
  include_when: BlobCondition;
  exclude_when: BlobCondition;
  dismiss_options?: BlobDismissOption[];
};

// ── Constants ────────────────────────────────────────────

export type BlobConstantValue = {
  id: number;
  name: string;
  label?: string;
  description: string | null;
  enabled: boolean;
};

// ── Dataset ──────────────────────────────────────────────

export type DatasetData = {
  facts: Record<string, BlobFact>;
  questions: BlobQuestion[];
  rules: BlobRule[];
  constants: Record<string, BlobConstantValue[]>;
  action_conditions: Record<string, BlobActionCondition>;
};

export type TestCase = {
  name: string;
  input_facts: Record<string, unknown>;
  expected_actions: string[];
};

export type DatasetBlob = {
  data: DatasetData;
  test_cases: TestCase[];
};

export type DatasetStatus = "live" | "draft";

export type DatasetMeta = {
  id: number;
  status: DatasetStatus;
};

export type Dataset = DatasetMeta & DatasetBlob;

// ── Enriched view types (computed, not stored) ───────────

export type FactOptionMapping = {
  option: string;
  value: string | boolean;
};

export type FactQuestionSource = {
  index: number;
  label: string;
  type: QuestionType;
  mappings?: FactOptionMapping[];
  defaultValue?: string | boolean;
};

export type FactRelationships = {
  setByQuestion?: FactQuestionSource;
  derivedFrom?: BlobRule;
  constrainedBy: BlobRule[];
  actionCount: number;
};

export type EnrichedFact = {
  id: string;
  type: FactType;
  core: boolean;
  category: string;
  values_ref?: string;
  enabled: boolean;
  relationships: FactRelationships;
};

export type FactCategory = {
  key: string;
  label: string;
  facts: EnrichedFact[];
};
