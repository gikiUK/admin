import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/feature-flags/use-catalogue", () => ({
  useFeatureFlagCatalogue: () => ({
    status: "ready",
    value: ["commuting_and_homeworking_survey", "energy_price_shock"]
  })
}));

jest.mock("@/lib/manage/api", () => ({
  addCompanyFeatureFlag: jest.fn(),
  removeCompanyFeatureFlag: jest.fn()
}));

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

import { OrgFeatureFlagsPanel } from "@/components/manage/org-feature-flags-panel";
import { addCompanyFeatureFlag, type ManagedCompany, removeCompanyFeatureFlag } from "@/lib/manage/api";

function makeCompany(overrides: Partial<ManagedCompany> = {}): ManagedCompany {
  return {
    id: 1,
    slug: "acme",
    name: "Acme",
    logo_url: null,
    members_count: 0,
    tracked_actions_count: 0,
    subscription_tier: "standard",
    subscription_status: "none",
    trial_ends_at: null,
    in_trial: false,
    gifted_premium_until: null,
    access_status: "standard",
    created_at: "2026-01-01T00:00:00Z",
    deleted_at: null,
    ...overrides
  };
}

test("shows an empty state when no flags are enabled", () => {
  render(<OrgFeatureFlagsPanel company={makeCompany()} onUpdate={jest.fn()} />);
  expect(screen.getByText("No flags enabled.")).toBeTruthy();
});

test("removes an enabled flag and reports the updated company", async () => {
  const company = makeCompany({ feature_flags: ["commuting_and_homeworking_survey"] });
  const updated = makeCompany({ feature_flags: [] });
  (removeCompanyFeatureFlag as jest.Mock).mockResolvedValue({ company: updated });
  const onUpdate = jest.fn();

  render(<OrgFeatureFlagsPanel company={company} onUpdate={onUpdate} />);
  fireEvent.click(screen.getByLabelText("Remove commuting_and_homeworking_survey"));

  await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(updated));
  expect(removeCompanyFeatureFlag).toHaveBeenCalledWith("acme", "commuting_and_homeworking_survey");
  expect(addCompanyFeatureFlag).not.toHaveBeenCalled();
});
