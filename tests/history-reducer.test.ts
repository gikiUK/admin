import { buildChangeEntry } from "@/lib/blob/change-log";
import { type DatasetState, datasetReducer, initialState } from "@/lib/blob/dataset-reducer";
import type { HistoryState } from "@/lib/blob/history";
import type { BlobFact, BlobQuestion, BlobRule, Dataset, DatasetData } from "@/lib/blob/types";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// ── Fixtures ────────────────────────────────────────────

const baseFact: BlobFact = { type: "boolean_state", core: true, enabled: true };
const baseQuestion: BlobQuestion = {
  type: "boolean_state",
  label: "Test question",
  fact: "test_fact",
  enabled: true
};
const baseRule: BlobRule = {
  sets: "test_fact",
  value: true,
  source: "general",
  when: { test_fact: true },
  enabled: true
};

const baseData: DatasetData = {
  facts: { test_fact: baseFact },
  questions: [baseQuestion],
  rules: [baseRule],
  constants: {},
  action_conditions: {}
};

const liveDataset: Dataset = { id: 1, status: "live", data: baseData, test_cases: [] };
const draftDataset: Dataset = { id: 2, status: "draft", data: clone(baseData), test_cases: [] };

function stateWithDraft(overrides?: Partial<DatasetState>): DatasetState {
  return {
    ...initialState,
    live: liveDataset,
    draft: draftDataset,
    dataset: draftDataset,
    original: clone(baseData),
    loading: false,
    isEditing: true,
    ...overrides
  };
}

// ── Tests ───────────────────────────────────────────────

describe("history reducer", () => {
  describe("basic mutation", () => {
    it("creates a history entry with correct entityRef and snapshots", () => {
      const state = stateWithDraft();
      const editedFact: BlobFact = { ...baseFact, core: false };
      const next = datasetReducer(state, { type: "SET_FACT", id: "test_fact", fact: editedFact });

      expect(next.history.entries).toHaveLength(1);
      const entry = next.history.entries[0];
      expect(entry.entityRef).toEqual({ type: "fact", key: "test_fact" });
      expect(entry.entityBefore).toEqual(baseFact);
      expect(entry.entityAfter).toEqual(editedFact);
      expect(entry.description).toBe('Edited fact "test_fact"');
      expect(next.isDirty).toBe(true);
      expect(next.history.cursor).toBe(0);
    });

    it("captures question snapshots on SET_QUESTION", () => {
      const state = stateWithDraft();
      const editedQ: BlobQuestion = { ...baseQuestion, label: "Updated question" };
      const next = datasetReducer(state, { type: "SET_QUESTION", index: 0, question: editedQ });

      const entry = next.history.entries[0];
      expect(entry.entityRef).toEqual({ type: "question", index: 0 });
      expect(entry.entityBefore).toEqual(baseQuestion);
      expect(entry.entityAfter).toEqual(editedQ);
    });

    it("captures rule snapshots on SET_RULE", () => {
      const state = stateWithDraft();
      const editedRule: BlobRule = { ...baseRule, value: false };
      const next = datasetReducer(state, { type: "SET_RULE", index: 0, rule: editedRule });

      const entry = next.history.entries[0];
      expect(entry.entityRef).toEqual({ type: "rule", index: 0 });
      expect(entry.entityBefore).toEqual(baseRule);
      expect(entry.entityAfter).toEqual(editedRule);
    });

    it("resolves ADD_QUESTION entityRef to correct index", () => {
      const state = stateWithDraft();
      const newQ: BlobQuestion = { type: "boolean_state", label: "New Q", enabled: true };
      const next = datasetReducer(state, { type: "ADD_QUESTION", question: newQ });

      const entry = next.history.entries[0];
      // Should resolve to index 1 (appended after the existing question)
      expect(entry.entityRef).toEqual({ type: "question", index: 1 });
      expect(entry.entityBefore).toBeUndefined();
      expect(entry.entityAfter).toEqual(newQ);
    });
  });

  describe("undo", () => {
    it("reverts data to previous state", () => {
      let state = stateWithDraft();
      const editedFact: BlobFact = { ...baseFact, core: false };
      state = datasetReducer(state, { type: "SET_FACT", id: "test_fact", fact: editedFact });
      expect(state.dataset?.data.facts.test_fact.core).toBe(false);

      state = datasetReducer(state, { type: "UNDO", cursor: -1 });
      expect(state.dataset?.data.facts.test_fact.core).toBe(true);
      expect(state.history.cursor).toBe(-1);
    });

    it("sets isDirty correctly after undo", () => {
      let state = stateWithDraft();
      const editedFact: BlobFact = { ...baseFact, core: false };
      state = datasetReducer(state, { type: "SET_FACT", id: "test_fact", fact: editedFact });
      expect(state.isDirty).toBe(true);

      // Undo to base — data matches live, so isDirty should be false
      state = datasetReducer(state, { type: "UNDO", cursor: -1 });
      expect(state.isDirty).toBe(false);
    });
  });

  describe("redo", () => {
    it("re-applies undone changes", () => {
      let state = stateWithDraft();
      const editedFact: BlobFact = { ...baseFact, core: false };
      state = datasetReducer(state, { type: "SET_FACT", id: "test_fact", fact: editedFact });
      state = datasetReducer(state, { type: "UNDO", cursor: -1 });
      expect(state.dataset?.data.facts.test_fact.core).toBe(true);

      state = datasetReducer(state, { type: "REDO", cursor: 0 });
      expect(state.dataset?.data.facts.test_fact.core).toBe(false);
      expect(state.isDirty).toBe(true);
      expect(state.history.cursor).toBe(0);
    });
  });

  describe("undo all (cursor -1)", () => {
    it("data equals base, isDirty is false", () => {
      let state = stateWithDraft();
      // Make two mutations
      state = datasetReducer(state, { type: "SET_FACT", id: "test_fact", fact: { ...baseFact, core: false } });
      state = datasetReducer(state, {
        type: "SET_QUESTION",
        index: 0,
        question: { ...baseQuestion, label: "Changed" }
      });
      expect(state.history.entries).toHaveLength(2);
      expect(state.history.cursor).toBe(1);

      // Undo all
      state = datasetReducer(state, { type: "UNDO", cursor: -1 });
      expect(state.history.cursor).toBe(-1);
      expect(state.isDirty).toBe(false);
      expect(state.dataset?.data).toEqual(baseData);
    });
  });

  describe("RESTORE_HISTORY", () => {
    it("replays correctly with fresh base", () => {
      const state = stateWithDraft();
      const editedFact: BlobFact = { ...baseFact, core: false };
      const entry = buildChangeEntry({ type: "SET_FACT", id: "test_fact", fact: editedFact }, baseData);
      const history: HistoryState = {
        entries: [entry],
        cursor: 0,
        base: clone(baseData)
      };

      const next = datasetReducer(state, { type: "RESTORE_HISTORY", history });
      expect(next.dataset?.data.facts.test_fact.core).toBe(false);
      expect(next.history.cursor).toBe(0);
      expect(next.isDirty).toBe(true);
    });

    it("discards stale history when base differs from live", () => {
      const state = stateWithDraft();
      // Simulate a persisted history whose base is different from current live
      const staleBase: DatasetData = {
        ...baseData,
        facts: { test_fact: { ...baseFact, category: "old" } }
      };
      const entry = buildChangeEntry(
        { type: "SET_FACT", id: "test_fact", fact: { ...baseFact, core: false } },
        staleBase
      );
      const history: HistoryState = {
        entries: [entry],
        cursor: 0,
        base: staleBase
      };

      const next = datasetReducer(state, { type: "RESTORE_HISTORY", history });
      // Should return state unchanged — stale history is discarded
      expect(next.history).toEqual(state.history);
      expect(next.dataset?.data).toEqual(state.dataset?.data);
    });
  });

  describe("new edit mid-history truncates future", () => {
    it("removes entries after cursor on new mutation", () => {
      let state = stateWithDraft();
      // Two edits
      state = datasetReducer(state, { type: "SET_FACT", id: "test_fact", fact: { ...baseFact, core: false } });
      state = datasetReducer(state, {
        type: "SET_QUESTION",
        index: 0,
        question: { ...baseQuestion, label: "Second edit" }
      });
      expect(state.history.entries).toHaveLength(2);

      // Undo the last one
      state = datasetReducer(state, { type: "UNDO", cursor: 0 });
      expect(state.history.cursor).toBe(0);
      expect(state.history.entries).toHaveLength(2); // entries still there, just cursor moved

      // New edit — should truncate the undone entry
      state = datasetReducer(state, { type: "SET_RULE", index: 0, rule: { ...baseRule, value: false } });
      expect(state.history.entries).toHaveLength(2); // entry[0] = SET_FACT, entry[1] = SET_RULE
      expect(state.history.cursor).toBe(1);
      expect(state.history.entries[1].action?.type).toBe("SET_RULE");
    });
  });

  describe("lifecycle entries", () => {
    it("DRAFT_PUBLISHED appends without moving cursor", () => {
      let state = stateWithDraft();
      state = datasetReducer(state, { type: "SET_FACT", id: "test_fact", fact: { ...baseFact, core: false } });
      const entriesBefore = state.history.entries.length;

      // Publish
      const data = state.dataset?.data ?? baseData;
      const publishedLive: Dataset = { id: 3, status: "live", data, test_cases: [] };
      state = datasetReducer(state, { type: "DRAFT_PUBLISHED", payload: publishedLive });

      expect(state.history.entries).toHaveLength(entriesBefore + 1);
      const lastEntry = state.history.entries[state.history.entries.length - 1];
      expect(lastEntry.isLifecycle).toBe(true);
      expect(lastEntry.description).toBe("Published to live");
      // DRAFT_PUBLISHED sets cursor to entries.length - 1 (end of timeline)
      expect(state.history.cursor).toBe(state.history.entries.length - 1);
    });

    it("DRAFT_DELETED appends discard entry and advances cursor", () => {
      let state = stateWithDraft();
      state = datasetReducer(state, { type: "SET_FACT", id: "test_fact", fact: { ...baseFact, core: false } });
      const entriesBefore = state.history.entries.length;

      state = datasetReducer(state, { type: "DRAFT_DELETED" });

      expect(state.history.entries).toHaveLength(entriesBefore + 1);
      const lastEntry = state.history.entries[state.history.entries.length - 1];
      expect(lastEntry.isDiscard).toBe(true);
      expect(lastEntry.description).toBe("Discarded draft");
      // Cursor is at the discard entry (it's a regular forward action)
      expect(state.history.cursor).toBe(entriesBefore);
      expect(state.isDirty).toBe(false);
    });

    it("DRAFT_DELETED is undoable — undo restores pre-discard data", () => {
      let state = stateWithDraft();
      state = datasetReducer(state, { type: "SET_FACT", id: "test_fact", fact: { ...baseFact, core: false } });
      expect(state.dataset?.data.facts.test_fact.core).toBe(false);

      // Discard
      state = datasetReducer(state, { type: "DRAFT_DELETED" });
      expect(state.dataset?.data.facts.test_fact.core).toBe(true); // reverted to live

      // Undo the discard — should restore the edited state
      state = datasetReducer(state, { type: "UNDO", cursor: 0 });
      expect(state.dataset?.data.facts.test_fact.core).toBe(false);
      expect(state.isDirty).toBe(true);

      // Redo the discard — should revert back to live
      state = datasetReducer(state, { type: "REDO", cursor: 1 });
      expect(state.dataset?.data.facts.test_fact.core).toBe(true);
      expect(state.isDirty).toBe(false);
      expect(state.history.cursor).toBe(1);
    });

    it("new edit after DRAFT_DELETED truncates discard from future", () => {
      let state = stateWithDraft();
      state = datasetReducer(state, { type: "SET_FACT", id: "test_fact", fact: { ...baseFact, core: false } });

      // Discard, then undo it
      state = datasetReducer(state, { type: "DRAFT_DELETED" });
      state = datasetReducer(state, { type: "UNDO", cursor: 0 });

      // New edit — should truncate the discard entry
      state = datasetReducer(state, {
        type: "SET_QUESTION",
        index: 0,
        question: { ...baseQuestion, label: "After discard" }
      });
      expect(state.history.entries).toHaveLength(2);
      expect(state.history.entries[1].description).toBe("Edited question #1");
      expect(state.history.cursor).toBe(1);
    });
  });

  describe("buildChangeEntry", () => {
    it("captures DISCARD_FACT with correct before/after", () => {
      const entry = buildChangeEntry({ type: "DISCARD_FACT", id: "test_fact" }, baseData);
      expect(entry.entityRef).toEqual({ type: "fact", key: "test_fact" });
      expect(entry.entityBefore).toEqual(baseFact);
      expect((entry.entityAfter as BlobFact).enabled).toBe(false);
    });

    it("captures ADD_FACT with no entityBefore", () => {
      const newFact: BlobFact = { type: "enum", core: false, enabled: true };
      const entry = buildChangeEntry({ type: "ADD_FACT", id: "new_fact", fact: newFact }, baseData);
      expect(entry.entityRef).toEqual({ type: "fact", key: "new_fact" });
      expect(entry.entityBefore).toBeUndefined();
      expect(entry.entityAfter).toEqual(newFact);
    });
  });

  describe("mutationVersion", () => {
    it("increments on each mutation", () => {
      let state = stateWithDraft();
      const v0 = state.mutationVersion;
      state = datasetReducer(state, { type: "SET_FACT", id: "test_fact", fact: { ...baseFact, core: false } });
      expect(state.mutationVersion).toBe(v0 + 1);
      state = datasetReducer(state, { type: "UNDO", cursor: -1 });
      expect(state.mutationVersion).toBe(v0 + 2);
      state = datasetReducer(state, { type: "REDO", cursor: 0 });
      expect(state.mutationVersion).toBe(v0 + 3);
    });
  });
});
