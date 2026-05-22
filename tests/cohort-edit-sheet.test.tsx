import { act, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { CohortEditSheet } from "@/components/analytics/insights/cohort/cohort-edit-sheet";
import { CohortProvider, useCohort } from "@/lib/analytics/insights/cohort-context";
import type { CohortSpec } from "@/lib/analytics/insights/cohort-spec";

const routerReplace = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: (...args: unknown[]) => routerReplace(...args) }),
  useSearchParams: () => mockSearchParams
}));

// Capture the Sheet's onOpenChange so the test can drive close events without
// mounting Radix's portal/animation machinery.
let lastOnOpenChange: ((open: boolean) => void) | null = null;
jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ onOpenChange, children }: { onOpenChange: (o: boolean) => void; children: ReactNode }) => {
    lastOnOpenChange = onOpenChange;
    return <div data-testid="sheet">{children}</div>;
  },
  SheetTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  SheetContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

// CohortBuilder pulls in the dataset + query layers we don't need here; stub it.
jest.mock("@/components/analytics/insights/cohort/cohort-builder", () => ({
  CohortBuilder: () => <div data-testid="cohort-builder" />
}));

beforeEach(() => {
  window.localStorage.clear();
  routerReplace.mockClear();
  mockSearchParams = new URLSearchParams();
  lastOnOpenChange = null;
});

describe("CohortEditSheet", () => {
  test("closing the drawer wipes uncommitted draft edits", () => {
    // Render the sheet and a sibling probe under one shared CohortProvider so
    // both see the same draft state.
    const captured: { current: ReturnType<typeof useCohort> | null } = { current: null };
    function Probe() {
      captured.current = useCohort();
      return null;
    }

    render(
      <CohortProvider>
        <Probe />
        <CohortEditSheet />
      </CohortProvider>
    );

    const dirty: CohortSpec = {
      org_filters: {},
      fact_filters: [{ id: "f1", key: "country", values: ["US"] }]
    };
    act(() => {
      captured.current?.setDraft(dirty);
    });
    expect(captured.current?.hasUnsavedChanges).toBe(true);

    act(() => {
      lastOnOpenChange?.(false);
    });

    expect(captured.current?.draft.fact_filters).toEqual([]);
    expect(captured.current?.hasUnsavedChanges).toBe(false);
    expect(routerReplace).not.toHaveBeenCalled();
  });
});
