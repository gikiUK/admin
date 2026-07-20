import type { Page } from "@playwright/test";
import { fillCode, fillTitle } from "@/e2e/helpers/selectors";
import { expect, test } from "@/e2e/mock-api/test-fixtures";

/** The value span of a details-panel row, located by its label span's sibling. */
function detailRowValue(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator("xpath=following-sibling::span[1]");
}

/**
 * One spec, one round-trip: fill every field on the form and assert that the
 * exact persisted shape matches Rails' SerializeSignupLink (via mock) AND
 * that what we sent matches Rails' Admin::SignupLinksController#create_params
 * permit list (via captured request body).
 */
test.describe("Signup link — full-payload create round-trip", () => {
  test.beforeEach(({ mockApi }) => {
    mockApi.store.featureFlags = ["energy_price_shock", "carbon_lite"];
    mockApi.store.companyTags = [{ name: "vip", count: 5 }];
  });

  test("every field flows through to the API and back to the UI", async ({ page, mockApi }) => {
    await page.goto("/signup-links/new");

    await fillTitle(page, "Partner X");
    await fillCode(page, "PARTNERX");
    // enabled defaults to true; flip off then back on to exercise the switch.
    await page.getByRole("switch", { name: /^enabled$/i }).click();
    await page.getByRole("switch", { name: /^enabled$/i }).click();

    await page.locator("input#expires_on").fill("2027-01-01");
    await page.locator("input#max_uses").fill("5");
    await page.locator("input#premium_until").fill("2027-01-01T00:00");

    // Skip flags & workshop onboarding
    await page.getByRole("switch", { name: /skip email confirmation/i }).click();
    await page.getByRole("switch", { name: /workshop onboarding/i }).click();

    // Feature flag pick
    await page.getByRole("button", { name: /pick flags/i }).click();
    await page.getByRole("option", { name: "energy_price_shock" }).click();
    await page.keyboard.press("Escape");

    // Analytics tag (free-create)
    await page.getByRole("button", { name: /add tag/i }).click();
    await page.getByPlaceholder("Search…").fill("partner-x");
    await page.getByRole("option", { name: /Create.*partner-x/i }).click();
    await page.keyboard.press("Escape");

    // Welcome page on, fill both
    await page.getByRole("switch", { name: /enable welcome page/i }).click();
    await page.locator("input#welcome_page_title").fill("Welcome!");
    await page.locator("textarea#welcome_page_body").fill("## Body");

    await page.getByRole("button", { name: /create signup link/i }).click();
    await page.waitForURL(/\/signup-links\/mock-uuid-/);

    const [created] = mockApi.byMethod("POST", "/admin/signup_links");
    expect(created.body).toMatchObject({
      signup_link: {
        title: "Partner X",
        code: "PARTNERX",
        enabled: true,
        expires_on: "2027-01-01",
        max_uses: 5,
        skip_email_confirmation: true,
        skip_welcome_email: false,
        workshop_onboarding: true,
        feature_flags: ["energy_price_shock"],
        analytics_tags: ["partner-x"],
        welcome_page_title: "Welcome!",
        welcome_page_body: "## Body"
      }
    });
    // premium_until is datetime-local converted to ISO (browser-TZ dependent),
    // so we assert it's a valid ISO string near our target rather than equal.
    const payload = (created.body as { signup_link: Record<string, unknown> }).signup_link;
    expect(typeof payload.premium_until).toBe("string");
    expect(String(payload.premium_until)).toMatch(/^20(26|27)-(12|01)-/);

    // The UI should now render every value we sent.
    await expect(page.getByRole("heading", { name: "Partner X" })).toBeVisible();
    await expect(page.getByText(/Code: PARTNERX/)).toBeVisible();
    await expect(page.getByText("energy_price_shock", { exact: true })).toBeVisible();
    await expect(page.getByText("partner-x", { exact: true })).toBeVisible();
    // Scope to the detail row so we don't collide with other "Yes" values (e.g. workshop onboarding).
    await expect(detailRowValue(page, "Skip email confirmation")).toHaveText("Yes");
    await expect(detailRowValue(page, "Workshop onboarding")).toHaveText("Yes");
    await expect(page.getByRole("heading", { name: "Welcome!" })).toBeVisible(); // welcome preview
  });
});
