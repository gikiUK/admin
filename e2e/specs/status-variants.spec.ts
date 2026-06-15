import { buildSignupLink } from "@/e2e/mock-api/builders";
import { expect, test } from "@/e2e/mock-api/test-fixtures";

/**
 * `usable`, `expired`, `exhausted`, and `enabled` together drive the four
 * status badges shown on the table and details panel. We seed one link per
 * status and verify the UI renders the right badge — the inverse of the
 * frontend's `signupLinkStatus()` precedence (disabled > expired > exhausted
 * > active) — for both list and detail screens.
 */
test.describe("Signup link — status badges per server-state combination", () => {
  test("list renders every status badge", async ({ page, mockApi }) => {
    mockApi.store.links = [
      buildSignupLink({ uuid: "a", title: "ActiveOne", code: "A" }),
      buildSignupLink({ uuid: "b", title: "DisabledOne", code: "B", enabled: false, usable: false }),
      buildSignupLink({ uuid: "c", title: "ExpiredOne", code: "C", expired: true, usable: false }),
      buildSignupLink({
        uuid: "d",
        title: "ExhaustedOne",
        code: "D",
        exhausted: true,
        usable: false,
        uses_count: 5,
        max_uses: 5
      })
    ];

    await page.goto("/signup-links");
    await expect(page.getByText("Active", { exact: true })).toBeVisible();
    await expect(page.getByText("Disabled", { exact: true })).toBeVisible();
    await expect(page.getByText("Expired", { exact: true })).toBeVisible();
    await expect(page.getByText("Exhausted", { exact: true })).toBeVisible();
  });

  test("disabled wins over expired in the precedence", async ({ page, mockApi }) => {
    mockApi.store.links = [
      buildSignupLink({
        uuid: "both",
        title: "Both",
        code: "BOTH",
        enabled: false,
        expired: true,
        usable: false
      })
    ];
    await page.goto("/signup-links/both");
    await expect(page.getByText("Disabled", { exact: true })).toBeVisible();
    await expect(page.getByText("Expired", { exact: true })).toHaveCount(0);
  });
});
