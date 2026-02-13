// ── Condition types ──────────────────────────────────────

export type SimpleCondition = Record<string, string | boolean | string[]>;

export type AnyCondition = { any: SimpleCondition[] };

export type BlobCondition = SimpleCondition | AnyCondition;

// ── Fact ─────────────────────────────────────────────────

export type FactType = "boolean_state" | "enum" | "array";

export type BlobFact = {
  type: FactType;
  core: boolean;
  category: string;
  values_ref?: string;
  discarded?: boolean;
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
  discarded?: boolean;
};

// ── Rule ─────────────────────────────────────────────────

export type BlobRule = {
  sets: string;
  value: boolean | string;
  source: "general" | "hotspot";
  when: BlobCondition;
  discarded?: boolean;
};

// ── Action condition ─────────────────────────────────────

export type BlobActionCondition = {
  include_when: BlobCondition;
  exclude_when: BlobCondition;
  discarded?: boolean;
};

// ── Dataset ──────────────────────────────────────────────

export type DatasetData = {
  facts: Record<string, BlobFact>;
  questions: BlobQuestion[];
  rules: BlobRule[];
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
  id: string;
  status: DatasetStatus;
  created_at: string;
  updated_at: string;
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
  discarded?: boolean;
  relationships: FactRelationships;
};

export type FactCategory = {
  key: string;
  label: string;
  facts: EnrichedFact[];
};
