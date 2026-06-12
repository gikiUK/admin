import { fillTitle, openAdvanced } from "@/e2e/helpers/selectors";
import { buildSignupLink } from "@/e2e/mock-api/builders";
import { expect, test } from "@/e2e/mock-api/test-fixtures";

/**
 * Welcome page is the only field group where the form state and the persisted
 * shape diverge: when `welcome_page_enabled` is false in form state, the
 * payload must send `welcome_page_title` AND `welcome_page_body` as null —
 * even if the user typed values before flipping the toggle off. The previous
 * payload-shape tests cover the unit; this verifies the round-trip.
 */
test.describe("Signup link — welcome page on/off", () => {
  test("create with welcome page filled persists both fields", async ({ page, mockApi }) => {
    await page.goto("/signup-links/new");
    await fillTitle(page, "WithWelcome");
    await openAdvanced(page);

    await page.getByRole("switch", { name: /enable welcome page/i }).click();
    await page.locator("input#welcome_page_title").fill("Hi there");
    await page.locator("textarea#welcome_page_body").fill("# Body");

    await page.getByRole("button", { name: /create signup link/i }).click();
    await page.waitForURL(/\/signup-links\/mock-uuid-/);

    const [post] = mockApi.byMethod("POST", "/admin/signup_links");
    expect(post.body).toMatchObject({
      signup_link: { welcome_page_title: "Hi there", welcome_page_body: "# Body" }
    });
  });

  test("toggling welcome page OFF on edit nulls both fields on the wire", async ({ page, mockApi }) => {
    mockApi.store.links = [
      buildSignupLink({
        uuid: "u-w",
        title: "WithWelcome",
        code: "W",
        welcome_page_title: "Old title",
        welcome_page_body: "Old body"
      })
    ];

    await page.goto("/signup-links/u-w/edit");
    await page.getByRole("switch", { name: /enable welcome page/i }).click(); // turn OFF
    await page.getByRole("button", { name: /save changes/i }).click();
    await page.waitForURL("**/signup-links/u-w");

    const [patch] = mockApi.byMethod("PATCH", "/admin/signup_links/u-w");
    expect(patch.body).toMatchObject({
      signup_link: { welcome_page_title: null, welcome_page_body: null }
    });
    // Show page no longer renders the welcome page preview.
    await expect(page.getByRole("heading", { name: "Welcome page" })).toHaveCount(0);
  });
});
