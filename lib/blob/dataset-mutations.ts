import type { BlobConstantValue, BlobFact, BlobQuestion, BlobRule, DatasetData } from "./types";

// ── Mutation actions (data-only subset of DatasetAction) ──

export type MutationAction =
  | { type: "SET_FACT"; id: string; fact: BlobFact }
  | { type: "ADD_FACT"; id: string; fact: BlobFact }
  | { type: "DISCARD_FACT"; id: string }
  | { type: "RESTORE_FACT"; id: string }
  | { type: "SET_RULE"; index: number; rule: BlobRule }
  | { type: "ADD_RULE"; rule: BlobRule }
  | { type: "DISCARD_RULE"; index: number }
  | { type: "SET_QUESTION"; index: number; question: BlobQuestion }
  | { type: "ADD_QUESTION"; question: BlobQuestion }
  | { type: "DISCARD_QUESTION"; index: number }
  | { type: "RESTORE_QUESTION"; index: number }
  | { type: "SET_CONSTANT_VALUE"; group: string; valueId: number; value: BlobConstantValue }
  | { type: "ADD_CONSTANT_VALUE"; group: string; value: BlobConstantValue }
  | { type: "TOGGLE_CONSTANT_VALUE"; group: string; valueId: number; enabled: boolean }
  | { type: "DELETE_CONSTANT_VALUE"; group: string; valueId: number };

export function applyAction(data: DatasetData, action: MutationAction): DatasetData {
  switch (action.type) {
    case "SET_FACT":
    case "ADD_FACT":
      return { ...data, facts: { ...data.facts, [action.id]: action.fact } };

    case "DISCARD_FACT": {
      const fact = data.facts[action.id];
      if (!fact) return data;
      return { ...data, facts: { ...data.facts, [action.id]: { ...fact, enabled: false } } };
    }

    case "RESTORE_FACT": {
      const fact = data.facts[action.id];
      if (!fact) return data;
      return { ...data, facts: { ...data.facts, [action.id]: { ...fact, enabled: true } } };
    }

    case "SET_RULE": {
      const rules = [...data.rules];
      rules[action.index] = action.rule;
      return { ...data, rules };
    }

    case "ADD_RULE":
      return { ...data, rules: [...data.rules, action.rule] };

    case "DISCARD_RULE": {
      const rules = [...data.rules];
      const rule = rules[action.index];
      if (!rule) return data;
      rules[action.index] = { ...rule, enabled: false };
      return { ...data, rules };
    }

    case "SET_QUESTION": {
      const questions = [...data.questions];
      questions[action.index] = action.question;
      return { ...data, questions };
    }

    case "ADD_QUESTION":
      return { ...data, questions: [...data.questions, action.question] };

    case "DISCARD_QUESTION": {
      const questions = [...data.questions];
      const question = questions[action.index];
      if (!question) return data;
      questions[action.index] = { ...question, enabled: false };
      return { ...data, questions };
    }

    case "RESTORE_QUESTION": {
      const questions = [...data.questions];
      const question = questions[action.index];
      if (!question) return data;
      questions[action.index] = { ...question, enabled: true };
      return { ...data, questions };
    }

    case "SET_CONSTANT_VALUE": {
      const group = data.constants[action.group];
      if (!group) return data;
      return {
        ...data,
        constants: {
          ...data.constants,
          [action.group]: group.map((v) => (v.id === action.valueId ? action.value : v))
        }
      };
    }

    case "ADD_CONSTANT_VALUE": {
      const existing = data.constants[action.group] ?? [];
      return {
        ...data,
        constants: { ...data.constants, [action.group]: [...existing, action.value] }
      };
    }

    case "TOGGLE_CONSTANT_VALUE": {
      const group = data.constants[action.group];
      if (!group) return data;
      return {
        ...data,
        constants: {
          ...data.constants,
          [action.group]: group.map((v) => (v.id === action.valueId ? { ...v, enabled: action.enabled } : v))
        }
      };
    }

    case "DELETE_CONSTANT_VALUE": {
      const group = data.constants[action.group];
      if (!group) return data;
      return {
        ...data,
        constants: {
          ...data.constants,
          [action.group]: group.filter((v) => v.id !== action.valueId)
        }
      };
    }

    default:
      return data;
  }
}
