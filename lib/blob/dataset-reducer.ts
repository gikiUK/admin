import type { BlobFact, BlobQuestion, BlobRule, Dataset } from "./types";

// ── State ────────────────────────────────────────────────

export type DatasetState = {
  dataset: Dataset | null;
  isDirty: boolean;
  saving: boolean;
};

export const initialState: DatasetState = {
  dataset: null,
  isDirty: false,
  saving: false
};

// ── Actions ──────────────────────────────────────────────

export type DatasetAction =
  | { type: "LOAD_DATASET"; payload: Dataset }
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
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "MARK_SAVED" };

// ── Helpers ──────────────────────────────────────────────

function withData(state: DatasetState, updater: (ds: Dataset) => Dataset): DatasetState {
  if (!state.dataset) return state;
  return { ...state, dataset: updater(state.dataset), isDirty: true };
}

// ── Reducer ──────────────────────────────────────────────

export function datasetReducer(state: DatasetState, action: DatasetAction): DatasetState {
  switch (action.type) {
    case "LOAD_DATASET":
      return { dataset: action.payload, isDirty: false, saving: false };

    case "SET_FACT":
      return withData(state, (ds) => ({
        ...ds,
        data: {
          ...ds.data,
          facts: { ...ds.data.facts, [action.id]: action.fact }
        }
      }));

    case "ADD_FACT":
      return withData(state, (ds) => ({
        ...ds,
        data: {
          ...ds.data,
          facts: { ...ds.data.facts, [action.id]: action.fact }
        }
      }));

    case "DISCARD_FACT":
      return withData(state, (ds) => {
        const fact = ds.data.facts[action.id];
        if (!fact) return ds;
        return {
          ...ds,
          data: {
            ...ds.data,
            facts: { ...ds.data.facts, [action.id]: { ...fact, discarded: true } }
          }
        };
      });

    case "RESTORE_FACT":
      return withData(state, (ds) => {
        const fact = ds.data.facts[action.id];
        if (!fact) return ds;
        return {
          ...ds,
          data: {
            ...ds.data,
            facts: { ...ds.data.facts, [action.id]: { ...fact, discarded: false } }
          }
        };
      });

    case "SET_RULE":
      return withData(state, (ds) => {
        const rules = [...ds.data.rules];
        rules[action.index] = action.rule;
        return { ...ds, data: { ...ds.data, rules } };
      });

    case "ADD_RULE":
      return withData(state, (ds) => ({
        ...ds,
        data: { ...ds.data, rules: [...ds.data.rules, action.rule] }
      }));

    case "DISCARD_RULE":
      return withData(state, (ds) => {
        const rules = [...ds.data.rules];
        const rule = rules[action.index];
        if (!rule) return ds;
        rules[action.index] = { ...rule, discarded: true };
        return { ...ds, data: { ...ds.data, rules } };
      });

    case "SET_QUESTION":
      return withData(state, (ds) => {
        const questions = [...ds.data.questions];
        questions[action.index] = action.question;
        return { ...ds, data: { ...ds.data, questions } };
      });

    case "ADD_QUESTION":
      return withData(state, (ds) => ({
        ...ds,
        data: { ...ds.data, questions: [...ds.data.questions, action.question] }
      }));

    case "DISCARD_QUESTION":
      return withData(state, (ds) => {
        const questions = [...ds.data.questions];
        const question = questions[action.index];
        if (!question) return ds;
        questions[action.index] = { ...question, discarded: true };
        return { ...ds, data: { ...ds.data, questions } };
      });

    case "RESTORE_QUESTION":
      return withData(state, (ds) => {
        const questions = [...ds.data.questions];
        const question = questions[action.index];
        if (!question) return ds;
        questions[action.index] = { ...question, discarded: false };
        return { ...ds, data: { ...ds.data, questions } };
      });

    case "SET_SAVING":
      return { ...state, saving: action.saving };

    case "MARK_SAVED":
      return { ...state, isDirty: false, saving: false };

    default:
      return state;
  }
}
