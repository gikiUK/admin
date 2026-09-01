import { render, screen } from "@testing-library/react";

let catalogue: string[] = [];

jest.mock("@/components/signup-links/form/use-form-data", () => ({
  useFeatureFlagCatalogue: () => ({ status: "ready", value: catalogue })
}));

import { FeatureFlagPicker } from "@/components/signup-links/form/feature-flag-picker";

function renderPicker(flags: string[], value: string[] = []) {
  catalogue = flags;
  return render(<FeatureFlagPicker value={value} onChange={() => {}} />);
}

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
