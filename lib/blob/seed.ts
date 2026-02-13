import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { assignCategory } from "@/lib/data/fact-categories";
import type {
  BlobActionCondition,
  BlobCondition,
  BlobFact,
  BlobQuestion,
  BlobRule,
  DatasetBlob,
  FactType,
  QuestionType
} from "./types";

const DATA_DIR = resolve(process.cwd(), "..", "facts", "data");

function readJSON<T>(filename: string): T {
  return JSON.parse(readFileSync(resolve(DATA_DIR, filename), "utf-8")) as T;
}

type RawFact = { type: FactType; core: boolean; values_ref?: string };
type RawQuestion = {
  type: QuestionType;
  label: string;
  description?: string;
  fact?: string;
  facts?: Record<string, Record<string, string | boolean>>;
  options?: { label: string; value: string; exclusive?: boolean }[];
  options_ref?: string;
  show_when?: BlobCondition;
  hide_when?: BlobCondition;
  unknowable?: boolean;
};
type RawRule = { sets: string; value: boolean | string; when: BlobCondition };
type RawAction = { title: string; include_when: BlobCondition; exclude_when: BlobCondition };

function seedFacts(): Record<string, BlobFact> {
  const { facts } = readJSON<{ facts: Record<string, RawFact> }>("facts.json");
  const result: Record<string, BlobFact> = {};
  for (const [id, raw] of Object.entries(facts)) {
    result[id] = {
      type: raw.type,
      core: raw.core,
      category: assignCategory(id),
      ...(raw.values_ref ? { values_ref: raw.values_ref } : {})
    };
  }
  return result;
}

function seedQuestions(): BlobQuestion[] {
  const { questions } = readJSON<{ questions: RawQuestion[] }>("questions.json");
  return questions.map((q) => {
    const question: BlobQuestion = { type: q.type, label: q.label };
    if (q.description) question.description = q.description;
    if (q.fact) question.fact = q.fact;
    if (q.facts) question.facts = q.facts;
    if (q.options) question.options = q.options;
    if (q.options_ref) question.options_ref = q.options_ref;
    if (q.show_when) question.show_when = q.show_when;
    if (q.hide_when) question.hide_when = q.hide_when;
    if (q.unknowable !== undefined) question.unknowable = q.unknowable;
    return question;
  });
}

function seedRules(): BlobRule[] {
  const { rules: hotspot } = readJSON<{ rules: RawRule[] }>("hotspot_rules.json");
  const { rules: general } = readJSON<{ rules: RawRule[] }>("general_rules.json");
  return [
    ...hotspot.map((r): BlobRule => ({ ...r, source: "hotspot" })),
    ...general.map((r): BlobRule => ({ ...r, source: "general" }))
  ];
}

function seedActionConditions(): Record<string, BlobActionCondition> {
  const actions = readJSON<RawAction[]>("actions.json");
  const result: Record<string, BlobActionCondition> = {};
  for (let i = 0; i < actions.length; i++) {
    result[`action_${i}`] = {
      include_when: actions[i].include_when,
      exclude_when: actions[i].exclude_when
    };
  }
  return result;
}

export function seedFromDisk(): DatasetBlob {
  return {
    data: {
      facts: seedFacts(),
      questions: seedQuestions(),
      rules: seedRules(),
      action_conditions: seedActionConditions()
    },
    test_cases: []
  };
}
