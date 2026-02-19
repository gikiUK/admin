import type { ChangeEntry } from "@/lib/blob/change-log";
import type { BlobQuestion } from "@/lib/blob/types";

/** Returns the route to navigate to for a given history entry, or null if none applies. */
export function actionHref(entry: ChangeEntry, currentQuestions: BlobQuestion[]): string | null {
  const { action, entityRef, entityAfter } = entry;
  if (!action) return null;

  switch (action.type) {
    case "SET_FACT":
    case "ADD_FACT":
    case "DISCARD_FACT":
    case "RESTORE_FACT":
      return `/data/facts/${action.id}`;

    case "SET_QUESTION":
    case "DISCARD_QUESTION":
    case "RESTORE_QUESTION":
    case "ADD_QUESTION": {
      const label = (entityAfter as BlobQuestion | undefined)?.label;
      if (label) {
        const idx = currentQuestions.findIndex((q) => q.label === label);
        if (idx >= 0) return `/data/questions/${idx}`;
      }
      if (entityRef?.type === "question") return `/data/questions/${entityRef.index}`;
      return "/data/questions";
    }

    case "SET_RULE":
    case "ADD_RULE":
    case "DISCARD_RULE":
    case "RESTORE_RULE":
      return "/data/rules";

    case "SET_CONSTANT_VALUE":
    case "ADD_CONSTANT_VALUE":
    case "TOGGLE_CONSTANT_VALUE":
    case "DELETE_CONSTANT_VALUE":
      return "/data/constants";

    default:
      return null;
  }
}
