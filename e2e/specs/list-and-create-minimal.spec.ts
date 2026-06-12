import { fillTitle } from "@/e2e/helpers/selectors";
import { buildSignupLink } from "@/e2e/mock-api/builders";
import { expect, test } from "@/e2e/mock-api/test-fixtures";

test.describe("Signup links — list & minimal create", () => {
  test("empty list shows the empty state", async ({ page, mockApi }) => {
    void mockApi;
    await page.goto("/signup-links");
    await expect(page.getByRole("heading", { name: "Signup Links" })).toBeVisible();
    await expect(page.getByText(/no signup links yet/i)).toBeVisible();
  });

  test("list renders seeded links with title, code, uses and status badge", async ({ page, mockApi }) => {
    mockApi.store.links = [
      buildSignupLink({ uuid: "u-a", title: "Alpha", code: "ALPHA", uses_count: 2, max_uses: 5 }),
      buildSignupLink({ uuid: "u-b", title: "Beta", code: "BETA", uses_count: 0, max_uses: null, enabled: false })
    ];

    await page.goto("/signup-links");
    await expect(page.getByRole("link", { name: "Alpha" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Beta" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "ALPHA", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "BETA", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "2 / 5" })).toBeVisible();
    await expect(page.getByText("Active", { exact: true })).toBeVisible();
    await expect(page.getByText("Disabled", { exact: true })).toBeVisible();
  });

  test("creating a link with only a title round-trips through the API", async ({ page, mockApi }) => {
    await page.goto("/signup-links/new");
    await fillTitle(page, "Minimal Link");
    await page.getByRole("button", { name: /create signup link/i }).click();

    await page.waitForURL(/\/signup-links\/mock-uuid-/);

    const creates = mockApi.byMethod("POST", "/admin/signup_links");
    expect(creates).toHaveLength(1);
    expect(creates[0].body).toMatchObject({
      signup_link: {
        title: "Minimal Link",
        enabled: true,
        expires_on: null,
        max_uses: null,
        premium_until: null,
        welcome_page_title: null,
        welcome_page_body: null,
        referrer_id: null,
        feature_flags: [],
        analytics_tags: [],
        analytics_cohorts: []
      }
    });
    // Crucially: blank code is omitted, not sent as "" — Rails auto-generates.
    expect((creates[0].body as { signup_link: Record<string, unknown> }).signup_link.code).toBeUndefined();

    // Server returned the canonical shape; show page renders it.
    await expect(page.getByRole("heading", { name: "Minimal Link" })).toBeVisible();
    await expect(page.getByText(/Code: AUTO-1/)).toBeVisible();
    // The link is now in the store; navigating back to the list shows it.
    await page.goto("/signup-links");
    await expect(page.getByRole("link", { name: "Minimal Link" })).toBeVisible();
  });
});
