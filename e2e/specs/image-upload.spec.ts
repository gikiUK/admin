import { buildSignupLink } from "@/e2e/mock-api/builders";
import { MOCK_IMAGE_URL } from "@/e2e/mock-api/routes";
import { expect, test } from "@/e2e/mock-api/test-fixtures";

/**
 * The image lives on its own endpoints (PATCH/DELETE …/image), not in the
 * signup_link payload — so this covers the round-trip that the form specs
 * can't: upload writes image_url, remove nulls it, and client-side guards
 * reject bad files before any request is made.
 */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

test.describe("Signup link — image", () => {
  test("uploads an image and then removes it", async ({ page, mockApi }) => {
    mockApi.store.links = [buildSignupLink({ uuid: "u-i", title: "ImageLink", code: "I", image_url: null })];

    await page.goto("/signup-links/u-i");
    await expect(page.getByText("No image attached.")).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles({ name: "pic.png", mimeType: "image/png", buffer: PNG });

    const image = page.getByRole("img", { name: /ImageLink signup link/i });
    await expect(image).toHaveAttribute("src", MOCK_IMAGE_URL);
    expect(mockApi.byMethod("PATCH", "/admin/signup_links/u-i/image")).toHaveLength(1);

    await page.getByRole("button", { name: /^remove$/i }).click();
    await expect(page.getByText("No image attached.")).toBeVisible();
    expect(mockApi.byMethod("DELETE", "/admin/signup_links/u-i/image")).toHaveLength(1);
  });

  test("rejects a non-image file without hitting the API", async ({ page, mockApi }) => {
    mockApi.store.links = [buildSignupLink({ uuid: "u-i", title: "ImageLink", code: "I", image_url: null })];

    await page.goto("/signup-links/u-i");
    await page
      .locator('input[type="file"]')
      .setInputFiles({ name: "doc.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });

    await expect(page.getByText(/must be a JPEG, PNG, GIF or WebP/i)).toBeVisible();
    expect(mockApi.byMethod("PATCH", "/image")).toHaveLength(0);
  });
});
