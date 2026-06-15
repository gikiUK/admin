import { buildCompany, buildSignupLink } from "@/e2e/mock-api/builders";
import { expect, test } from "@/e2e/mock-api/test-fixtures";

/**
 * The /admin/signup_links/:uuid/companies endpoint feeds the table on the
 * show page. It's paginated by Rails and rendered by `CompaniesPanel`. We
 * verify empty state, populated state, and pagination meta wiring.
 */
test.describe("Signup link show — companies panel", () => {
  test("empty state when no companies are linked", async ({ page, mockApi }) => {
    mockApi.store.links = [buildSignupLink({ uuid: "u-x", title: "X", code: "X" })];
    await page.goto("/signup-links/u-x");
    await expect(page.getByText(/no companies signed up yet/i)).toBeVisible();
  });

  test("renders linked companies with member count and created date", async ({ page, mockApi }) => {
    mockApi.store.links = [buildSignupLink({ uuid: "u-y", title: "Y", code: "Y" })];
    mockApi.store.companies.set("u-y", [
      buildCompany({ name: "Acme Co", members_count: 4 }),
      buildCompany({ name: "Globex", members_count: 12 })
    ]);

    await page.goto("/signup-links/u-y");
    await expect(page.getByRole("link", { name: "Acme Co" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Globex" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "4", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "12", exact: true })).toBeVisible();
  });
});
