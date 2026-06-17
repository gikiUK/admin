import { fireEvent, render, screen } from "@testing-library/react";
import { TrackedActionsSection } from "@/components/analytics/org-detail/tracked-actions-section";
import type { OrgTrackedAction } from "@/lib/analytics/api";

function makeAction(overrides: Partial<OrgTrackedAction> = {}): OrgTrackedAction {
  return {
    id: 1,
    action_type: "Action",
    action_id: 1,
    action_uuid: null,
    title: "Sample action",
    status: "in_progress",
    pre_giki_status: null,
    due_date: null,
    assignee_name: null,
    rejection_details: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides
  };
}

describe("TrackedActionsSection", () => {
  test("splits actions into active and rejected by status", () => {
    const actions = [
      makeAction({ id: 1, title: "Active one", status: "in_progress" }),
      makeAction({ id: 2, title: "Active two", status: "completed" }),
      makeAction({ id: 3, title: "Rejected one", status: "rejected" })
    ];

    render(<TrackedActionsSection actions={actions} />);

    expect(screen.getByText("Tracked actions (2)")).not.toBeNull();
    expect(screen.getByText("Active one")).not.toBeNull();
    expect(screen.getByText("Active two")).not.toBeNull();
    expect(screen.queryByText("Rejected one")).toBeNull();
  });

  test("shows an empty-state label and no count badge when there are no rejected actions", () => {
    render(<TrackedActionsSection actions={[makeAction({ status: "in_progress" })]} />);

    expect(screen.getByText("Rejected")).not.toBeNull();
    expect(screen.getByText("No rejected actions.")).not.toBeNull();
    expect(screen.queryByRole("button", { name: /rejected/i })).toBeNull();
  });

  test("expands the rejected list when the trigger is clicked", () => {
    const rejected = makeAction({ id: 9, title: "Rejected one", status: "rejected" });
    render(<TrackedActionsSection actions={[rejected]} />);

    expect(screen.queryByText("Rejected one")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /rejected/i }));

    expect(screen.getByText("Rejected one")).not.toBeNull();
  });

  test("renders rejection reason badge and reveals details popover when expanded", () => {
    const rejected = makeAction({
      id: 10,
      title: "Rejected with reason",
      status: "rejected",
      rejection_details: { reason: "cost", details: "Too expensive" }
    });
    render(<TrackedActionsSection actions={[rejected]} />);

    fireEvent.click(screen.getByRole("button", { name: /rejected/i }));

    expect(screen.getByText("Cost")).not.toBeNull();

    const detailsTrigger = screen.getByRole("button", { name: "Show rejection details" });
    fireEvent.click(detailsTrigger);

    expect(screen.getByText("Too expensive")).not.toBeNull();
  });
});
