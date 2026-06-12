import { buildSignupLink } from "@/e2e/mock-api/builders";
import { expect, test } from "@/e2e/mock-api/test-fixtures";

/**
 * Two delete scenarios: happy-path destroy (frees up the link, redirects to
 * the index) and the Rails-emitted signup_link_in_use 422 path (consumed_count
 * > 0 means companies depend on it, so the destroy is refused).
 */
test.describe("Signup link — delete flow", () => {
  test("happy delete from the show page removes the link and routes home", async ({ page, mockApi }) => {
    mockApi.store.links = [buildSignupLink({ uuid: "u-del", title: "Doomed", code: "DOOM" })];

    await page.goto("/signup-links/u-del");
    await page.getByRole("button", { name: /^delete$/i }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: /^delete$/i })
      .click();

    await page.waitForURL("**/signup-links");
    expect(mockApi.byMethod("DELETE", "/admin/signup_links/u-del")).toHaveLength(1);
    expect(mockApi.store.links.find((l) => l.uuid === "u-del")).toBeUndefined();
    await expect(page.getByText(/no signup links yet/i)).toBeVisible();
  });

  test("delete refused when consumed_count > 0 surfaces the error to the user", async ({ page, mockApi }) => {
    mockApi.store.links = [buildSignupLink({ uuid: "u-busy", title: "Busy", code: "BUSY", consumed_count: 3 })];

    await page.goto("/signup-links/u-busy");
    await page.getByRole("button", { name: /^delete$/i }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: /^delete$/i })
      .click();

    // Toast surfaces the Rails error.
    await expect(page.getByText(/signup link in use/i)).toBeVisible();
    // Link still exists, still on the show page.
    expect(mockApi.store.links.find((l) => l.uuid === "u-busy")).toBeDefined();
    await expect(page).toHaveURL(/\/signup-links\/u-busy/);
  });
});
