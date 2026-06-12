/**
 * Playwright test-fixture extension that auto-installs the mock API per test.
 *
 * Usage in specs:
 *   import { test, expect } from "@/e2e/mock-api/test-fixtures";
 *
 *   test("…", async ({ page, mockApi }) => {
 *     mockApi.store.referrers = [{ id: 1, name: "Partner" }];
 *     await page.goto("/signup-links");
 *     …
 *   });
 */
import { test as base, expect } from "@playwright/test";
import { installMockApi, type MockServer } from "./routes";
import { MockStore, type StoreSeed } from "./store";

type Fixtures = {
  mockApi: MockServer;
  storeSeed: StoreSeed;
};

export const test = base.extend<Fixtures>({
  storeSeed: [{}, { option: true }],
  mockApi: async ({ page, storeSeed }, use) => {
    const store = new MockStore(storeSeed);
    const server = await installMockApi(page, store);
    await use(server);
  }
});

export { expect };
