import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Condition, Question, QuestionType } from "./types";

const DATA_DIR = resolve(process.cwd(), "..", "facts", "data");

type RawQuestion = {
  type: QuestionType;
  label: string;
  description?: string;
  fact?: string;
  facts?: Record<string, Record<string, string | boolean>>;
  options?: { label: string; value: string; exclusive?: boolean }[];
  options_ref?: string;
  show_when?: Condition;
  hide_when?: Condition;
  unknowable?: boolean;
};

export function loadQuestions(): Question[] {
  const raw = readFileSync(resolve(DATA_DIR, "questions.json"), "utf-8");
  const { questions } = JSON.parse(raw) as { questions: RawQuestion[] };

  return questions.map((q, index) => {
    const question: Question = {
      index,
      type: q.type,
      label: q.label
    };

    if (q.description) question.description = q.description;
    if (q.fact) question.fact = q.fact;
    if (q.facts) question.facts = q.facts;
    if (q.options) question.options = q.options;
    if (q.options_ref) question.optionsRef = q.options_ref;
    if (q.show_when) question.showWhen = q.show_when;
    if (q.hide_when) question.hideWhen = q.hide_when;
    if (q.unknowable !== undefined) question.unknowable = q.unknowable;

    return question;
  });
}
