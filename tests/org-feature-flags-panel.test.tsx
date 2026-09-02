import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ManagedCompany } from "@/lib/manage/api";

const catalogue = ["bcorp", "action_management", "action_details"];

jest.mock("@/components/signup-links/form/use-form-data", () => ({
  useFeatureFlagCatalogue: () => ({ status: "ready", value: catalogue })
}));

const addCompanyFeatureFlag = jest.fn();
const removeCompanyFeatureFlag = jest.fn();
const updateCompany = jest.fn();

jest.mock("@/lib/manage/api", () => ({
  addCompanyFeatureFlag: (...args: unknown[]) => addCompanyFeatureFlag(...args),
  removeCompanyFeatureFlag: (...args: unknown[]) => removeCompanyFeatureFlag(...args),
  updateCompany: (...args: unknown[]) => updateCompany(...args)
}));

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

import { OrgFeatureFlagsPanel } from "@/components/manage/org-feature-flags-panel";

function buildCompany(overrides: Partial<ManagedCompany> = {}): ManagedCompany {
  return {
    id: 1,
    slug: "acme",
    name: "Acme",
    feature_flags: [],
    premium_feature_flags: [],
    feature_flags_enabled_until: null,
    ...overrides
  } as ManagedCompany;
}

function renderPanel(company: ManagedCompany, onUpdate = jest.fn()) {
  render(<OrgFeatureFlagsPanel company={company} onUpdate={onUpdate} />);
  return onUpdate;
}

function saveButton(): HTMLButtonElement {
  return screen.getByRole("button", { name: "Save" }) as HTMLButtonElement;
}

beforeEach(() => {
  jest.clearAllMocks();
  addCompanyFeatureFlag.mockImplementation((_slug: string, flag: string) =>
    Promise.resolve({ company: buildCompany({ feature_flags: [flag] }) })
  );
  removeCompanyFeatureFlag.mockResolvedValue({ company: buildCompany() });
  updateCompany.mockResolvedValue({ company: buildCompany() });
});

describe("OrgFeatureFlagsPanel", () => {
  test("Save is disabled until something changes", () => {
    renderPanel(buildCompany({ feature_flags: ["bcorp"] }));

    expect(saveButton().disabled).toBe(true);
  });

  test("ticking a flag sends only that addition", async () => {
    renderPanel(buildCompany({ feature_flags: ["bcorp"] }));

    fireEvent.click(screen.getByLabelText("Manage actions (assignees, due dates, notes)"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(addCompanyFeatureFlag).toHaveBeenCalledTimes(1));
    expect(addCompanyFeatureFlag).toHaveBeenCalledWith("acme", "action_management");
    // bcorp was already set, so it must not be re-sent.
    expect(removeCompanyFeatureFlag).not.toHaveBeenCalled();
  });

  test("unticking a flag sends only that removal", async () => {
    renderPanel(buildCompany({ feature_flags: ["bcorp", "action_management"] }));

    fireEvent.click(screen.getByLabelText("B Corp certification"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(removeCompanyFeatureFlag).toHaveBeenCalledTimes(1));
    expect(removeCompanyFeatureFlag).toHaveBeenCalledWith("acme", "bcorp");
    expect(addCompanyFeatureFlag).not.toHaveBeenCalled();
  });

  test("a mixed edit sends both an add and a remove", async () => {
    renderPanel(buildCompany({ feature_flags: ["bcorp"] }));

    fireEvent.click(screen.getByLabelText("B Corp certification"));
    fireEvent.click(screen.getByLabelText("Implementation details and downloads"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(addCompanyFeatureFlag).toHaveBeenCalledWith("acme", "action_details"));
    expect(removeCompanyFeatureFlag).toHaveBeenCalledWith("acme", "bcorp");
  });

  test("Reset restores the saved flags and re-disables Save", () => {
    renderPanel(buildCompany({ feature_flags: ["bcorp"] }));

    fireEvent.click(screen.getByLabelText("Implementation details and downloads"));
    expect(saveButton().disabled).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(saveButton().disabled).toBe(true);
    expect(addCompanyFeatureFlag).not.toHaveBeenCalled();
  });

  test("expiry is read-only until the API accepts it, so no update is sent", async () => {
    renderPanel(buildCompany({ feature_flags: ["bcorp"], feature_flags_enabled_until: "2027-01-01" }));

    expect((screen.getByLabelText("Feature flags enabled until") as HTMLInputElement).disabled).toBe(true);

    fireEvent.click(screen.getByLabelText("Implementation details and downloads"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(addCompanyFeatureFlag).toHaveBeenCalled());
    expect(updateCompany).not.toHaveBeenCalled();
  });

  test("warns when the stored expiry has already passed", () => {
    renderPanel(buildCompany({ feature_flags: ["bcorp"], feature_flags_enabled_until: "2020-01-01" }));

    expect(screen.getByText(/expired on 2020-01-01/)).toBeDefined();
  });

  test("shows no expiry warning for a future date", () => {
    renderPanel(buildCompany({ feature_flags: ["bcorp"], feature_flags_enabled_until: "2099-01-01" }));

    expect(screen.queryByText(/expired on/)).toBeNull();
  });

  test("a failed call still pushes the last good company up", async () => {
    addCompanyFeatureFlag.mockRejectedValueOnce(new Error("boom"));
    const onUpdate = renderPanel(buildCompany({ feature_flags: [] }));

    fireEvent.click(screen.getByLabelText("B Corp certification"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
  });
});
