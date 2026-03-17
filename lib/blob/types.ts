// ── Re-export shared types from @gikiuk/facts-engine ────
export type {
  AllCondition,
  Answer,
  AnyCondition,
  BlobActionCondition,
  BlobCondition,
  BlobConstantValue,
  BlobDismissOption,
  BlobFact,
  BlobOption,
  BlobQuestion,
  BlobRule,
  ConditionResult,
  Dataset,
  DatasetBlob,
  DatasetData,
  DatasetMeta,
  DatasetStatus,
  Facts,
  FactType,
  QuestionType,
  SimpleCondition,
  TestCase
} from "@gikiuk/facts-engine";

// ── Action (from /admin/actions, not part of dataset) ────
export type Action = {
  id: number;
  uuid: string;
  title: string;
  enabled: boolean;
};

import type { BlobRule, FactType, QuestionType } from "@gikiuk/facts-engine";

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
