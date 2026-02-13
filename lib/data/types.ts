export type FactType = "boolean_state" | "enum" | "array";

export type FactDefinition = {
  id: string;
  type: FactType;
  core: boolean;
  valuesRef?: string;
  values?: string[];
};

export type QuestionType = "boolean_state" | "single-select" | "multi-select" | "checkbox-radio-hybrid";

export type SimpleCondition = Record<string, string | boolean | string[]>;

export type AnyCondition = {
  any: SimpleCondition[];
};

export type Condition = SimpleCondition | AnyCondition;

export type CheckboxRadioOption = {
  label: string;
  value: string;
  exclusive?: boolean;
};

export type Question = {
  index: number;
  type: QuestionType;
  label: string;
  description?: string;
  fact?: string;
  facts?: Record<string, Record<string, string | boolean>>;
  options?: CheckboxRadioOption[];
  optionsRef?: string;
  showWhen?: Condition;
  hideWhen?: Condition;
  unknowable?: boolean;
};

export type ConstantValue = string | { label: string; value: string };

export type ConstantGroup = {
  name: string;
  values: ConstantValue[];
};

export type Rule = {
  sets: string;
  value: boolean | string;
  when: Condition;
};

export type FactOptionMapping = {
  option: string;
  value: string | boolean;
};

export type FactQuestionSource = {
  index: number;
  label: string;
  type: QuestionType;
  /** For hybrid questions: how each option sets this fact */
  mappings?: FactOptionMapping[];
  /** For hybrid questions: the default value */
  defaultValue?: string | boolean;
};

export type FactRelationships = {
  setByQuestion?: FactQuestionSource;
  derivedFrom?: Rule;
  constrainedBy: Rule[];
  actionCount: number;
};

export type EnrichedFact = FactDefinition & {
  relationships: FactRelationships;
  category: string;
};

export type FactCategory = {
  key: string;
  label: string;
  facts: EnrichedFact[];
};
