import { fillTitle } from "@/e2e/helpers/selectors";
import { buildSignupLink } from "@/e2e/mock-api/builders";
import { MOCK_IMAGE_URL } from "@/e2e/mock-api/routes";
import { expect, test } from "@/e2e/mock-api/test-fixtures";

/**
 * The welcome page image lives on its own endpoints (PATCH/DELETE …/image),
 * not in the signup_link payload — so an existing link uploads immediately
 * while a new one has to wait until create has handed back a uuid. Both paths
 * are covered here, along with the client-side guard.
 */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);
const PNG_UPLOAD = { name: "pic.png", mimeType: "image/png", buffer: PNG };

function seedLink(store: { links: unknown[] }) {
  store.links = [
    buildSignupLink({
      uuid: "u-i",
      title: "ImageLink",
      code: "I",
      welcome_page_title: "Hello",
      welcome_page_body: "Body",
      image_url: null
    })
  ];
}

test.describe("Signup link — welcome page image", () => {
  test("edit: uploads immediately, shows on the welcome page preview, then removes", async ({ page, mockApi }) => {
    seedLink(mockApi.store);

    await page.goto("/signup-links/u-i/edit");
    await page.locator("input#welcome_page_image").setInputFiles(PNG_UPLOAD);

    await expect(page.getByRole("img", { name: "Welcome page" })).toHaveAttribute("src", MOCK_IMAGE_URL);
    expect(mockApi.byMethod("PATCH", "/admin/signup_links/u-i/image")).toHaveLength(1);

    // The show page renders it inside the welcome page preview, not standalone.
    await page.goto("/signup-links/u-i");
    const preview = page.getByRole("img", { name: "Hello" });
    await expect(preview).toHaveAttribute("src", MOCK_IMAGE_URL);

    await page.goto("/signup-links/u-i/edit");
    await page.getByRole("button", { name: /^remove$/i }).click();
    await expect(page.getByRole("img", { name: "Welcome page" })).toHaveCount(0);
    expect(mockApi.byMethod("DELETE", "/admin/signup_links/u-i/image")).toHaveLength(1);
  });

  test("new: the picked file is held locally and uploaded after create", async ({ page, mockApi }) => {
    await page.goto("/signup-links/new");
    await fillTitle(page, "Fresh");
    await page.getByRole("switch", { name: /enable welcome page/i }).click();
    await page.locator("input#welcome_page_title").fill("Hi");
    await page.locator("textarea#welcome_page_body").fill("# Body");

    await page.locator("input#welcome_page_image").setInputFiles(PNG_UPLOAD);
    await expect(page.getByText(/uploads when the link is created/i)).toBeVisible();
    expect(mockApi.byMethod("PATCH", "/image")).toHaveLength(0);

    await page.getByRole("button", { name: /create signup link/i }).click();
    await page.waitForURL(/\/signup-links\/mock-uuid-/);

    const [upload] = mockApi.byMethod("PATCH", "/image");
    expect(upload).toBeDefined();
    await expect(page.getByRole("img", { name: "Hi" })).toHaveAttribute("src", MOCK_IMAGE_URL);
  });

  test("rejects a non-image file without hitting the API", async ({ page, mockApi }) => {
    seedLink(mockApi.store);

    await page.goto("/signup-links/u-i/edit");
    await page
      .locator("input#welcome_page_image")
      .setInputFiles({ name: "doc.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });

    await expect(page.getByText(/must be a JPEG, PNG, GIF or WebP/i)).toBeVisible();
    expect(mockApi.byMethod("PATCH", "/image")).toHaveLength(0);
  });
});
