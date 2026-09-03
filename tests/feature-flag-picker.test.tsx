import { fireEvent, render, screen } from "@testing-library/react";

let catalogue: string[] = [];

jest.mock("@/components/signup-links/form/use-form-data", () => ({
  useFeatureFlagCatalogue: () => ({ status: "ready", value: catalogue })
}));

import { FeatureFlagPicker } from "@/components/signup-links/form/feature-flag-picker";

function renderPicker(flags: string[], value: string[] = [], lockedFlags: string[] = [], onChange = () => {}) {
  catalogue = flags;
  return render(<FeatureFlagPicker value={value} onChange={onChange} lockedFlags={lockedFlags} />);
}

describe("FeatureFlagPicker flag dependencies", () => {
  const TEAM = ["invite_readonly_users", "invite_full_users"];

  test("ticking full invites ticks read-only invites too", () => {
    const onChange = jest.fn();
    renderPicker(TEAM, [], [], onChange);

    fireEvent.click(screen.getByLabelText("Invite colleagues who can edit"));

    expect(onChange).toHaveBeenCalledWith(["invite_full_users", "invite_readonly_users"]);
  });

  test("unticking read-only invites unticks full invites too", () => {
    const onChange = jest.fn();
    renderPicker(TEAM, TEAM, [], onChange);

    fireEvent.click(screen.getByLabelText("Invite read-only colleagues"));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  test("unticking full invites leaves read-only invites on", () => {
    const onChange = jest.fn();
    renderPicker(TEAM, TEAM, [], onChange);

    fireEvent.click(screen.getByLabelText("Invite colleagues who can edit"));

    expect(onChange).toHaveBeenCalledWith(["invite_readonly_users"]);
  });

  test("doesn't store a required flag premium already grants", () => {
    const onChange = jest.fn();
    renderPicker(TEAM, [], ["invite_readonly_users"], onChange);

    fireEvent.click(screen.getByLabelText("Invite colleagues who can edit"));

    expect(onChange).toHaveBeenCalledWith(["invite_full_users"]);
  });
});

describe("FeatureFlagPicker locked flags", () => {
  test("shows a locked flag ticked and read-only", () => {
    renderPicker(["bcorp", "action_management"], [], ["action_management"]);

    const locked = screen.getByLabelText("Manage actions (assignees, due dates, notes)") as HTMLInputElement;
    expect(locked.getAttribute("data-state")).toBe("checked");
    expect(locked.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText("PREMIUM")).toBeDefined();
  });

  test("leaves unlocked flags editable", () => {
    renderPicker(["bcorp", "action_management"], [], ["action_management"]);

    const unlocked = screen.getByLabelText("B Corp certification") as HTMLInputElement;
    expect(unlocked.getAttribute("data-state")).toBe("unchecked");
    expect(unlocked.hasAttribute("disabled")).toBe(false);
  });

  test("counts locked flags as enabled", () => {
    renderPicker(["bcorp", "action_management", "action_details"], ["bcorp"], ["action_management"]);

    expect(screen.getByText("2 of 3 enabled")).toBeDefined();
  });

  // Storing a flag premium already grants would be a no-op, so bulk controls
  // leave it out of the draft.
  test("Enable all skips locked flags", () => {
    const onChange = jest.fn();
    renderPicker(["bcorp", "action_management", "action_details"], [], ["action_management"], onChange);

    fireEvent.click(screen.getByRole("button", { name: "Enable all" }));

    expect(onChange).toHaveBeenCalledWith(["bcorp", "action_details"]);
  });

  test("a group's all on skips locked flags", () => {
    const onChange = jest.fn();
    renderPicker(["action_management", "action_details"], [], ["action_management"], onChange);

    fireEvent.click(screen.getByRole("button", { name: "all on" }));

    expect(onChange).toHaveBeenCalledWith(["action_details"]);
  });

  test("hides the bulk buttons when only one flag is editable", () => {
    renderPicker(["bcorp", "action_management"], [], ["action_management"]);

    expect(screen.queryByRole("button", { name: "Enable all" })).toBeNull();
  });
});

describe("FeatureFlagPicker bulk controls", () => {
  // Enable all / Disable all on a single checkbox just restates the checkbox.
  test("hides the bulk buttons when the catalogue holds one flag", () => {
    renderPicker(["bcorp"]);

    expect(screen.getByLabelText("B Corp certification")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Enable all" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Disable all" })).toBeNull();
  });

  test("shows the bulk buttons once there is more than one flag", () => {
    renderPicker(["bcorp", "action_management"]);

    expect(screen.getByRole("button", { name: "Enable all" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Disable all" })).toBeDefined();
  });

  test("hides a group's all on/off when that group holds one flag", () => {
    // Certification carries only bcorp, while Actions carries two.
    renderPicker(["bcorp", "action_management", "action_details"]);

    expect(screen.getAllByRole("button", { name: "all on" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "all off" })).toHaveLength(1);
  });

  test("shows no group controls when every group holds one flag", () => {
    renderPicker(["bcorp", "energy_price_shock"]);

    expect(screen.queryByRole("button", { name: "all on" })).toBeNull();
    // The top-level buttons still show, since there's more than one flag overall.
    expect(screen.getByRole("button", { name: "Enable all" })).toBeDefined();
  });
});
