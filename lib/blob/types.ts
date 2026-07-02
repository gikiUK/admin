// ── Re-export shared types from @gikiuk/facts-engine ────
export type {
  Action,
  AllCondition,
  Answer,
  AnyCondition,
  BlobActionCondition,
  BlobCondition,
  BlobConstantValue,
  BlobDismissOption,
  BlobFact,
  BlobOption,
  BlobRule,
  ConditionResult,
  DatasetMeta,
  DatasetStatus,
  Facts,
  FactType,
  QuestionType,
  SimpleCondition,
  TestCase
} from "@gikiuk/facts-engine";

import type {
  BlobRule,
  DatasetMeta,
  BlobQuestion as EngineBlobQuestion,
  DatasetData as EngineDatasetData,
  FactType,
  QuestionType,
  TestCase
} from "@gikiuk/facts-engine";

/** The engine type doesn't declare `onboarding_group`, but the stored data uses it
 *  (raw-JSON blob, so it round-trips fine). Extend locally until the engine catches up. */
export type BlobQuestion = EngineBlobQuestion & {
  onboarding_group?: string;
};

// Re-declare the containers so they carry the extended question type.
export type DatasetData = Omit<EngineDatasetData, "questions"> & { questions: BlobQuestion[] };
export type DatasetBlob = { data: DatasetData; test_cases: TestCase[] };
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
