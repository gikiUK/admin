import { buildSignupLink } from "@/e2e/mock-api/builders";
import { expect, test } from "@/e2e/mock-api/test-fixtures";

/**
 * The "code lock" is the most failure-mode-rich part of the form: on edit the
 * code field is read-only behind a confirmation dialog, and the PATCH payload
 * must include `code` only when the user actually changed it. Each branch is
 * verified here against the captured PATCH body.
 */
test.describe("Signup link — edit code lock", () => {
  const SEED = buildSignupLink({ uuid: "u-existing", code: "OLDCODE", title: "Existing Link" });

  test.beforeEach(({ mockApi }) => {
    mockApi.store.links = [SEED];
  });

  test("saving without unlocking does NOT send `code` in the PATCH", async ({ page, mockApi }) => {
    await page.goto("/signup-links/u-existing/edit");
    await expect(page.locator("input#code")).toBeDisabled();

    await page.getByRole("button", { name: /save changes/i }).click();
    await page.waitForURL("**/signup-links/u-existing");

    const [patch] = mockApi.byMethod("PATCH", "/admin/signup_links/u-existing");
    expect(patch.body).toMatchObject({ signup_link: { title: "Existing Link" } });
    const sent = (patch.body as { signup_link: Record<string, unknown> }).signup_link;
    expect(sent.code).toBeUndefined();
  });

  test("unlock + change includes the new `code` in the PATCH", async ({ page, mockApi }) => {
    await page.goto("/signup-links/u-existing/edit");

    await page.getByRole("button", { name: /^change$/i }).click();
    await expect(page.getByText(/Changing the code means/i)).toBeVisible();
    await page.getByRole("button", { name: /change code/i }).click();
    await expect(page.locator("input#code")).toBeEnabled();

    await page.locator("input#code").fill("NEWCODE");
    await page.getByRole("button", { name: /save changes/i }).click();
    await page.waitForURL("**/signup-links/u-existing");

    const [patch] = mockApi.byMethod("PATCH", "/admin/signup_links/u-existing");
    expect(patch.body).toMatchObject({ signup_link: { code: "NEWCODE" } });

    // And the show page now shows the new code, served from the in-memory store.
    await expect(page.getByText(/Code: NEWCODE/)).toBeVisible();
  });

  test("toggling Enabled off PATCHes with enabled:false", async ({ page, mockApi }) => {
    await page.goto("/signup-links/u-existing/edit");

    await page.getByRole("switch", { name: /^enabled$/i }).click();
    await page.getByRole("button", { name: /save changes/i }).click();
    await page.waitForURL("**/signup-links/u-existing");

    const [patch] = mockApi.byMethod("PATCH", "/admin/signup_links/u-existing");
    expect(patch.body).toMatchObject({ signup_link: { enabled: false } });
    // The show page now reflects the disabled status.
    await expect(page.getByText("Disabled")).toBeVisible();
  });
});
