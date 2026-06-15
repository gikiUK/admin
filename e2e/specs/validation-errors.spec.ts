import { expect, test } from "@/e2e/mock-api/test-fixtures";

/**
 * The frontend disables submit when title is blank, so we trigger Rails-side
 * validation errors via an override: force the mock to 422 on POST. The form
 * must surface the message instead of redirecting.
 */
test.describe("Signup link — server validation errors", () => {
  test("422 from create surfaces the error and stays on the form", async ({ page, mockApi }) => {
    mockApi.setHandlerOverride("POST /admin/signup_links", async (route) => {
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          error: { type: "validation_error", message: "Title has already been taken", errors: { title: ["taken"] } }
        })
      });
    });

    await page.goto("/signup-links/new");
    await page.locator("input#title").fill("Dup");
    await page.getByRole("button", { name: /create signup link/i }).click();

    await expect(page.getByText("Title has already been taken")).toBeVisible();
    await expect(page).toHaveURL(/\/signup-links\/new$/);
  });
});
